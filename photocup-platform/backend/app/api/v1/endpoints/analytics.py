from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from app.db.session import get_db
from app.api.deps import get_current_user
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct
from app.models.user import User, UserRole
from app.models.photo import Photo, Score
import math
from collections import defaultdict

router = APIRouter()


@router.get("/admin/summary")
def get_admin_summary(db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    total_photos = db.query(Photo).count()
    total_countries = db.query(Photo.country).distinct().count()
    return {
        "total_users": total_users,
        "total_photos": total_photos,
        "total_countries": total_countries,
        "status": "success"
    }


@router.get("/governance")
def get_governance_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    country: Optional[str] = Query(None, description="Filter by country")
):
    """Comprehensive governance metrics for the admin dashboard."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin only")

    # ── Raw data (unfiltered for available_countries) ──
    all_users_raw = db.query(User).all()
    all_photos_raw = db.query(Photo).all()

    # Build available countries list (always full, regardless of filter)
    _participant_countries = set(u.country for u in all_users_raw if u.role == UserRole.PARTICIPANT and u.country)
    _photo_countries = set(p.country for p in all_photos_raw if p.country)
    available_countries = sorted(_participant_countries | _photo_countries)

    # ── Apply country filter ──
    if country:
        all_users = [u for u in all_users_raw if (u.country or '').lower() == country.lower() or u.role in (UserRole.JUDGE, UserRole.ADMIN)]
        all_photos = [p for p in all_photos_raw if (p.country or '').lower() == country.lower()]
        filtered_photo_ids = set(p.id for p in all_photos)
        all_scores = [s for s in db.query(Score).all() if s.photo_id in filtered_photo_ids]
    else:
        all_users = all_users_raw
        all_photos = all_photos_raw
        all_scores = db.query(Score).all()

    participants = [u for u in all_users if u.role == UserRole.PARTICIPANT]
    judges = [u for u in all_users if u.role == UserRole.JUDGE]
    coordinators = [u for u in all_users if u.role == UserRole.NATIONAL_COORDINATOR]

    total_photos = len(all_photos)
    total_participants = len(participants)
    total_judges = len(judges)
    total_scores = len(all_scores)

    # ════════════════════════════════════════════════════════════════
    # 1. PARTICIPATION METRICS
    # ════════════════════════════════════════════════════════════════

    # Volume
    participant_countries = set(u.country for u in participants if u.country)
    photo_countries = set(p.country for p in all_photos if p.country)
    all_countries = participant_countries | photo_countries
    categories_with_photos = set(p.category for p in all_photos if p.category)

    avg_photos_per_participant = round(total_photos / total_participants, 2) if total_participants > 0 else 0

    # Users who submitted at least one photo
    submitters = set(p.owner_id for p in all_photos)
    registered_not_submitted = total_participants - len(submitters)
    submission_rate = round(len(submitters) / total_participants * 100, 1) if total_participants > 0 else 0

    # Distribution by country
    photos_by_country = defaultdict(int)
    participants_by_country = defaultdict(int)
    for p in all_photos:
        photos_by_country[p.country or 'Unknown'] += 1
    for u in participants:
        participants_by_country[u.country or 'Unknown'] += 1

    country_distribution = []
    for country in sorted(all_countries | set(participants_by_country.keys())):
        n_participants = participants_by_country.get(country, 0)
        n_photos = photos_by_country.get(country, 0)
        avg = round(n_photos / n_participants, 2) if n_participants > 0 else 0
        country_distribution.append({
            "country": country,
            "participants": n_participants,
            "photos": n_photos,
            "avg_photos_per_participant": avg,
        })
    country_distribution.sort(key=lambda x: x["photos"], reverse=True)

    countries_without_photos = [c for c in country_distribution if c["photos"] == 0]

    # Distribution by category
    photos_by_category = defaultdict(int)
    participants_by_category = defaultdict(set)
    for p in all_photos:
        cat = p.category or 'Uncategorized'
        photos_by_category[cat] += 1
        if p.owner_id:
            participants_by_category[cat].add(p.owner_id)

    category_distribution = []
    for cat in sorted(photos_by_category.keys()):
        n_photos = photos_by_category[cat]
        n_participants = len(participants_by_category[cat])
        category_distribution.append({
            "category": cat,
            "photos": n_photos,
            "participants": n_participants,
            "avg_photos": round(n_photos / n_participants, 2) if n_participants > 0 else 0,
        })
    category_distribution.sort(key=lambda x: x["photos"], reverse=True)

    avg_photos_per_category = round(total_photos / len(categories_with_photos), 1) if categories_with_photos else 0
    saturated_threshold = avg_photos_per_category * 1.5
    underrep_threshold = avg_photos_per_category * 0.5
    saturated_categories = [c["category"] for c in category_distribution if c["photos"] > saturated_threshold]
    underrepresented_categories = [c["category"] for c in category_distribution if 0 < c["photos"] < underrep_threshold]

    # Funnel
    funnel = {
        "registered_users": total_participants,
        "submitted_at_least_one": len(submitters),
        "not_submitted": registered_not_submitted,
        "submission_rate_pct": submission_rate,
        "abandonment_rate_pct": round(100 - submission_rate, 1),
    }

    participation = {
        "total_participants": total_participants,
        "total_photos": total_photos,
        "total_judges": total_judges,
        "total_coordinators": len(coordinators),
        "total_countries": len(all_countries),
        "total_categories": len(categories_with_photos),
        "avg_photos_per_participant": avg_photos_per_participant,
        "country_distribution": country_distribution,
        "countries_without_photos": countries_without_photos,
        "category_distribution": category_distribution,
        "saturated_categories": saturated_categories,
        "underrepresented_categories": underrepresented_categories,
        "funnel": funnel,
    }

    # ════════════════════════════════════════════════════════════════
    # 2. OPERATIONAL METRICS
    # ════════════════════════════════════════════════════════════════

    # Photo validation proxy: photos with 0 scores = "pending review"
    scored_photo_ids = set(s.photo_id for s in all_scores)
    photos_pending_review = total_photos - len(scored_photo_ids)
    photos_with_scores = len(scored_photo_ids)

    # File size stats
    sizes = [p.file_size for p in all_photos if p.file_size and p.file_size > 0]
    avg_file_size_mb = round(sum(sizes) / len(sizes) / (1024 * 1024), 2) if sizes else 0
    max_file_size_mb = round(max(sizes) / (1024 * 1024), 2) if sizes else 0

    # Photos missing metadata
    photos_no_exif = sum(1 for p in all_photos if not p.metadata_exif)

    # Users by role
    users_by_role = defaultdict(int)
    for u in all_users:
        users_by_role[u.role.value] += 1

    operational = {
        "photos_pending_review": photos_pending_review,
        "photos_with_scores": photos_with_scores,
        "photos_no_exif_metadata": photos_no_exif,
        "avg_file_size_mb": avg_file_size_mb,
        "max_file_size_mb": max_file_size_mb,
        "users_by_role": dict(users_by_role),
        "active_users": sum(1 for u in all_users if u.is_active),
        "inactive_users": sum(1 for u in all_users if not u.is_active),
    }

    # ════════════════════════════════════════════════════════════════
    # 3. JUDGING ANALYTICS
    # ════════════════════════════════════════════════════════════════

    # Per-judge metrics
    scores_by_judge = defaultdict(list)
    for s in all_scores:
        scores_by_judge[s.judge_id].append(s)

    judge_metrics = []
    all_judge_averages = []

    for judge in judges:
        j_scores = scores_by_judge.get(judge.id, [])
        n_reviewed = len(j_scores)
        pct_complete = round(n_reviewed / total_photos * 100, 1) if total_photos > 0 else 0

        if n_reviewed > 0:
            totals = [s.total_score for s in j_scores if s.total_score is not None]
            avg = round(sum(totals) / len(totals), 2) if totals else 0
            all_judge_averages.append(avg)

            # Standard deviation
            if len(totals) > 1:
                mean = sum(totals) / len(totals)
                variance = sum((x - mean) ** 2 for x in totals) / (len(totals) - 1)
                stddev = round(math.sqrt(variance), 2)
            else:
                stddev = 0

            # Score range usage
            min_score = min(totals)
            max_score = max(totals)
            score_range = round(max_score - min_score, 1)

            # Distribution buckets (1-3 low, 4-6 mid, 7-10 high)
            low = sum(1 for t in totals if t < 4)
            mid = sum(1 for t in totals if 4 <= t < 7)
            high = sum(1 for t in totals if t >= 7)

            # Individual score breakdown
            impacts = [s.impact for s in j_scores if s.impact is not None]
            techniques = [s.technique for s in j_scores if s.technique is not None]
            compositions = [s.composition for s in j_scores if s.composition is not None]
            stories = [s.story for s in j_scores if s.story is not None]

            criteria_avgs = {
                "impact": round(sum(impacts) / len(impacts), 1) if impacts else 0,
                "technique": round(sum(techniques) / len(techniques), 1) if techniques else 0,
                "composition": round(sum(compositions) / len(compositions), 1) if compositions else 0,
                "story": round(sum(stories) / len(stories), 1) if stories else 0,
            }
        else:
            avg = 0
            stddev = 0
            min_score = 0
            max_score = 0
            score_range = 0
            low = mid = high = 0
            criteria_avgs = {"impact": 0, "technique": 0, "composition": 0, "story": 0}

        judge_metrics.append({
            "judge_id": judge.id,
            "judge_name": judge.full_name or judge.email,
            "country": judge.country,
            "photos_reviewed": n_reviewed,
            "pct_complete": pct_complete,
            "avg_score": avg,
            "stddev": stddev,
            "min_score": round(min_score, 1),
            "max_score": round(max_score, 1),
            "score_range": score_range,
            "distribution": {"low": low, "mid": mid, "high": high},
            "criteria_avgs": criteria_avgs,
        })

    judge_metrics.sort(key=lambda x: x["photos_reviewed"], reverse=True)

    # Global judge mean for outlier detection
    global_judge_mean = round(sum(all_judge_averages) / len(all_judge_averages), 2) if all_judge_averages else 0
    global_judge_stddev = 0
    if len(all_judge_averages) > 1:
        variance = sum((x - global_judge_mean) ** 2 for x in all_judge_averages) / (len(all_judge_averages) - 1)
        global_judge_stddev = round(math.sqrt(variance), 2)

    # Outliers: judges whose avg is > 1.5 stddev from mean
    outlier_judges = []
    if global_judge_stddev > 0:
        for jm in judge_metrics:
            if jm["avg_score"] == 0:
                continue
            z = round((jm["avg_score"] - global_judge_mean) / global_judge_stddev, 2)
            if abs(z) > 1.5:
                outlier_judges.append({
                    "judge_name": jm["judge_name"],
                    "avg_score": jm["avg_score"],
                    "z_score": z,
                    "label": "Generous" if z > 0 else "Strict",
                })

    # Judges with suspicious patterns (all same score)
    repetitive_judges = []
    for jm in judge_metrics:
        j_scores_list = scores_by_judge.get(jm["judge_id"], [])
        if len(j_scores_list) >= 3:
            totals = [s.total_score for s in j_scores_list if s.total_score is not None]
            unique = set(totals)
            if len(unique) <= 2 and len(totals) >= 5:
                repetitive_judges.append({
                    "judge_name": jm["judge_name"],
                    "unique_scores": len(unique),
                    "total_reviews": len(totals),
                })

    # ════════════════════════════════════════════════════════════════
    # 4. INTER-JUDGE CONSISTENCY (per photo)
    # ════════════════════════════════════════════════════════════════

    scores_by_photo = defaultdict(list)
    for s in all_scores:
        if s.total_score is not None:
            scores_by_photo[s.photo_id].append(s.total_score)

    photo_score_analysis = []
    disagreements = []
    for photo_id, totals in scores_by_photo.items():
        n_judges = len(totals)
        avg = round(sum(totals) / n_judges, 2)
        if n_judges > 1:
            variance = sum((x - avg) ** 2 for x in totals) / (n_judges - 1)
            stddev = round(math.sqrt(variance), 2)
        else:
            stddev = 0
        spread = round(max(totals) - min(totals), 1) if totals else 0

        photo = next((p for p in all_photos if p.id == photo_id), None)
        entry = {
            "photo_id": photo_id,
            "photo_title": photo.title if photo else "Unknown",
            "category": photo.category if photo else "Unknown",
            "country": photo.country if photo else "Unknown",
            "num_judges": n_judges,
            "avg_score": avg,
            "stddev": stddev,
            "spread": spread,
        }
        photo_score_analysis.append(entry)
        if n_judges >= 2:
            disagreements.append(stddev)

    # Photos with extreme disagreement (top 5)
    photo_score_analysis.sort(key=lambda x: x["stddev"], reverse=True)
    extreme_disagreement = photo_score_analysis[:5] if photo_score_analysis else []

    avg_disagreement = round(sum(disagreements) / len(disagreements), 2) if disagreements else 0

    # Evaluation coverage
    photos_with_min_judges = sum(1 for v in scores_by_photo.values() if len(v) >= 2)
    pct_min_coverage = round(photos_with_min_judges / total_photos * 100, 1) if total_photos > 0 else 0

    # Score distribution per category
    category_score_analysis = defaultdict(list)
    for entry in photo_score_analysis:
        category_score_analysis[entry["category"]].append(entry["avg_score"])

    category_scores = []
    for cat, avgs in category_score_analysis.items():
        cat_mean = round(sum(avgs) / len(avgs), 2)
        if len(avgs) > 1:
            cat_var = sum((x - cat_mean) ** 2 for x in avgs) / (len(avgs) - 1)
            cat_std = round(math.sqrt(cat_var), 2)
        else:
            cat_std = 0
        category_scores.append({
            "category": cat,
            "num_photos_scored": len(avgs),
            "avg_score": cat_mean,
            "stddev": cat_std,
        })
    category_scores.sort(key=lambda x: x["avg_score"], reverse=True)

    judging = {
        "judge_metrics": judge_metrics,
        "global_judge_mean": global_judge_mean,
        "global_judge_stddev": global_judge_stddev,
        "outlier_judges": outlier_judges,
        "repetitive_judges": repetitive_judges,
        "avg_inter_judge_disagreement": avg_disagreement,
        "extreme_disagreement_photos": extreme_disagreement,
        "photos_with_min_2_judges": photos_with_min_judges,
        "pct_min_2_coverage": pct_min_coverage,
        "category_scores": category_scores,
    }

    # ════════════════════════════════════════════════════════════════
    # 5. RESULTS & EQUITY
    # ════════════════════════════════════════════════════════════════

    # Top 10 photos overall
    photo_ranking = sorted(photo_score_analysis, key=lambda x: x["avg_score"], reverse=True)
    top_10 = photo_ranking[:10]

    # Country representation in top 10
    top_countries = defaultdict(int)
    for p in top_10:
        top_countries[p["country"] or "Unknown"] += 1
    top_country_distribution = [{"country": k, "count": v} for k, v in sorted(top_countries.items(), key=lambda x: -x[1])]

    # Number of distinct countries in top 10
    countries_in_top = len(top_countries)

    # Concentration index: Herfindahl–Hirschman (HHI)
    # 0 = perfectly distributed, 10000 = one country takes all
    total_top = sum(top_countries.values())
    if total_top > 0:
        hhi = round(sum((c / total_top * 100) ** 2 for c in top_countries.values()), 0)
    else:
        hhi = 0

    # Category winners (top photo per category)
    category_winners = {}
    for entry in photo_ranking:
        cat = entry["category"]
        if cat not in category_winners:
            category_winners[cat] = entry
    winners_by_category = list(category_winners.values())

    # Ratio participation vs prizes by country
    country_equity = []
    for cd in country_distribution:
        c = cd["country"]
        top_count = top_countries.get(c, 0)
        participation_share = round(cd["photos"] / total_photos * 100, 1) if total_photos > 0 else 0
        prize_share = round(top_count / total_top * 100, 1) if total_top > 0 else 0
        country_equity.append({
            "country": c,
            "photos": cd["photos"],
            "participants": cd["participants"],
            "top10_count": top_count,
            "participation_share_pct": participation_share,
            "prize_share_pct": prize_share,
        })
    country_equity.sort(key=lambda x: x["prize_share_pct"], reverse=True)

    results = {
        "top_10": top_10,
        "top_country_distribution": top_country_distribution,
        "countries_in_top_10": countries_in_top,
        "hhi_concentration": hhi,
        "winners_by_category": winners_by_category,
        "country_equity": country_equity,
    }

    # ════════════════════════════════════════════════════════════════
    # FINAL RESPONSE
    # ════════════════════════════════════════════════════════════════
    return {
        "participation": participation,
        "operational": operational,
        "judging": judging,
        "results": results,
        "available_countries": available_countries,
        "active_country_filter": country,
    }
