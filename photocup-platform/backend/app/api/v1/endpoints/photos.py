from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from app.db.session import get_db
from app.models.photo import Photo, Score
from app.models.user import User, UserRole
from app.api.deps import get_current_user
import shutil
import os

router = APIRouter()

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    try:
        # Total stats
        total_photos = db.query(Photo).count()
        total_participants = db.query(User).filter(User.role == UserRole.PARTICIPANT).count()
        total_scores = db.query(Score).count()

        # Category distribution
        categories = db.query(Photo.category, func.count(Photo.id)).group_by(Photo.category).all()
        category_data = [{"name": (c[0] if c[0] else "Sin Categoría"), "value": c[1]} for c in categories]

        # Country distribution
        countries = db.query(Photo.country, func.count(Photo.id)).group_by(Photo.country).all()
        country_data = [{"name": (c[0] if c[0] else "N/A"), "Participantes": c[1]} for c in countries]

        # Leaderboard (Top 10)
        photos = db.query(Photo).all()
        leaderboard = []
        for p in photos:
            photo_scores = db.query(Score).filter(Score.photo_id == p.id).all()
            if not photo_scores:
                avg_score = 0
                judge_details = []
            else:
                photo_averages = [
                    ((s.impact or 0) + (s.technique or 0) + (s.composition or 0) + (s.story or 0)) / 4 
                    for s in photo_scores
                ]
                avg_score = round(sum(photo_averages) / len(photo_averages), 1)
                judge_details = []
                for s in photo_scores:
                    judge_name = s.judge.full_name if s.judge else "Juez Invitado"
                    judge_score = round(((s.impact or 0) + (s.technique or 0) + (s.composition or 0) + (s.story or 0)) / 4, 1)
                    judge_details.append({"name": judge_name, "score": judge_score})
            
            leaderboard.append({
                "id": p.id,
                "title": p.title if p.title else "Sin Título",
                "author": p.owner.full_name if p.owner else "Anónimo",
                "score": avg_score,
                "category": p.category if p.category else "General",
                "judgeScores": judge_details
            })
        
        leaderboard = sorted(leaderboard, key=lambda x: x["score"], reverse=True)[:10]

        # Detailed Ranking (All photos with vote count)
        detailed_ranking = []
        for p in photos:
            photo_scores = db.query(Score).filter(Score.photo_id == p.id).all()
            vote_count = len(photo_scores)
            if vote_count > 0:
                photo_averages = [
                    ((s.impact or 0) + (s.technique or 0) + (s.composition or 0) + (s.story or 0)) / 4 
                    for s in photo_scores
                ]
                avg_score = round(sum(photo_averages) / len(photo_averages), 1)
                total_points = sum(photo_averages)
            else:
                avg_score = 0
                total_points = 0
            
            detailed_ranking.append({
                "id": p.id,
                "title": p.title if p.title else "Sin Título",
                "author": p.owner.full_name if p.owner else "Anónimo",
                "category": p.category if p.category else "General",
                "country": p.country if p.country else "Global",
                "total_points": round(total_points, 1),
                "vote_count": vote_count,
                "avg_score": avg_score
            })
        
        detailed_ranking = sorted(detailed_ranking, key=lambda x: x["avg_score"], reverse=True)

        # Judge Performance
        judges = db.query(User).filter(User.role == UserRole.JUDGE).all()
        judge_perf = []
        for j in judges:
            j_scores = db.query(Score).filter(Score.judge_id == j.id).all()
            count = len(j_scores)
            if count > 0:
                avg = sum([((s.impact or 0) + (s.technique or 0) + (s.composition or 0) + (s.story or 0)) / 4 for s in j_scores]) / count
            else:
                avg = 0
            judge_perf.append({
                "name": j.full_name if j.full_name else j.email,
                "reviews": count,
                "avgScore": round(avg, 1)
            })

        return {
            "total_photos": total_photos,
            "total_participants": total_participants,
            "total_scores": total_scores,
            "category_data": category_data,
            "country_data": country_data,
            "leaderboard": leaderboard,
            "detailed_ranking": detailed_ranking,
            "judge_performance": judge_perf
        }
    except Exception as e:
        print(f"Error in get_stats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.get("/")
def get_photos(db: Session = Depends(get_db)):
    return db.query(Photo).options(joinedload(Photo.owner)).all()

@router.post("/upload")
async def upload_photo(
    file: UploadFile = File(...),
    title: str = Form(...),
    description: str = Form(""),
    category: str = Form("Nature"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    file_path = os.path.join(UPLOAD_DIR, file.filename).replace("\\", "/")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    new_photo = Photo(
        title=title, 
        description=description, 
        category=category, 
        file_path=file_path,
        country=current_user.country if current_user.country else "Mensa Global",
        owner_id=current_user.id
    )
    db.add(new_photo)
    db.commit()

    return {
        "id": new_photo.id,
        "filename": file.filename,
        "title": title,
        "category": category,
        "message": "Upload successful"
    }

@router.get("/judges")
def get_judges():
    """Get all judges with their evaluation statistics"""
    from app.db.session import get_db
    from app.models.user import User, UserRole
    from app.models.photo import Score
    from sqlalchemy.orm import Session
    
    db = next(get_db())
    try:
        judges = db.query(User).filter(User.role == UserRole.JUDGE).all()
        judges_data = []
        
        for judge in judges:
            scores = db.query(Score).filter(Score.judge_id == judge.id).all()
            scores_count = len(scores)
            
            avg_score = 0
            last_activity = None
            
            if scores_count > 0:
                avg_score = round(sum(s.total_score for s in scores) / scores_count, 2)
                last_activity = max(s.created_at for s in scores).isoformat()
                
            judges_data.append({
                "id": judge.id,
                "name": judge.full_name if judge.full_name else judge.email,
                "email": judge.email,
                "evaluations": scores_count,
                "avg_score": avg_score,
                "last_activity": last_activity
            })
        
        return judges_data
    except Exception as e:
        print(f"Error in get_judges: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"error": str(e)}
    finally:
        db.close()

@router.get("/judges/{judge_id}/evaluations")
def get_judge_evaluations(judge_id: int, db: Session = Depends(get_db)):
    """Get all evaluations made by a specific judge"""
    judge = db.query(User).filter(User.id == judge_id, User.role == UserRole.JUDGE).first()
    if not judge:
        raise HTTPException(status_code=404, detail="Judge not found")
    
    scores = db.query(Score).filter(Score.judge_id == judge_id).options(joinedload(Score.photo)).all()
    
    evaluations = []
    for score in scores:
        avg_score = round(((score.impact or 0) + (score.technique or 0) + (score.composition or 0) + (score.story or 0)) / 4, 1)
        evaluations.append({
            "photo_id": score.photo.id,
            "photo_title": score.photo.title if score.photo.title else "Sin Título",
            "photo_author": score.photo.owner.full_name if score.photo.owner else "Anónimo",
            "category": score.photo.category if score.photo.category else "General",
            "impact": score.impact,
            "technique": score.technique,
            "composition": score.composition,
            "story": score.story,
            "avg_score": avg_score,
            "comment": score.comment if score.comment else ""
        })
    
    # Sort by average score descending
    evaluations = sorted(evaluations, key=lambda x: x["avg_score"], reverse=True)
    
    return {
        "judge_id": judge.id,
        "judge_name": judge.full_name if judge.full_name else judge.email,
        "total_evaluations": len(evaluations),
        "evaluations": evaluations
    }

@router.post("/{photo_id}/score")
def score_photo(
    photo_id: int,
    impact: int = Form(...),
    technique: int = Form(...),
    composition: int = Form(...),
    story: int = Form(...),
    comment: str = Form(""),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    print(f"DEBUG: Receiving score for photo {photo_id} from user {current_user.id}")
    total = (impact + technique + composition + story) / 4
    
    # Update or create logic
    existing_score = db.query(Score).filter(
        Score.photo_id == photo_id, 
        Score.judge_id == current_user.id
    ).first()
    
    if existing_score:
        print(f"DEBUG: Updating existing score {existing_score.id}")
        existing_score.impact = impact
        existing_score.technique = technique
        existing_score.composition = composition
        existing_score.story = story
        existing_score.total_score = total
        existing_score.comment = comment
    else:
        print(f"DEBUG: Creating new score")
        new_score = Score(
            photo_id=photo_id,
            impact=impact,
            technique=technique,
            composition=composition,
            story=story,
            total_score=total,
            comment=comment,
            judge_id=current_user.id
        )
        db.add(new_score)
    
    db.commit()
    print(f"DEBUG: Total scores in DB now: {db.query(Score).count()}")
    return {"status": "success", "total_score": total}

@router.delete("/remove-item/{photo_id}")
def delete_photo(
    photo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a photo and its associated files and scores (scores via cascade)"""
    print(f"DEBUG DELETE: Received request for photo_id={photo_id} from user={current_user.email}")
    
    if current_user.role != UserRole.ADMIN:
        print(f"DEBUG DELETE: User {current_user.email} is not ADMIN (Role: {current_user.role})")
        raise HTTPException(status_code=403, detail="Only administrators can delete photos")
    
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    if not photo:
        all_ids = [p.id for p in db.query(Photo).all()]
        msg = f"Photo with ID {photo_id} not found. Available in DB: {all_ids}"
        print(f"DEBUG DELETE: {msg}")
        raise HTTPException(status_code=404, detail=msg)
    
    print(f"DEBUG DELETE: Found photo '{photo.title}' (ID: {photo.id}). Deleting file...")
    if photo.file_path and os.path.exists(photo.file_path):
        try:
            os.remove(photo.file_path)
        except Exception as e:
            print(f"Error deleting file {photo.file_path}: {e}")
            
    # Delete thumbnail if it exists
    if photo.thumbnail_path and os.path.exists(photo.thumbnail_path):
        try:
            os.remove(photo.thumbnail_path)
        except Exception as e:
            print(f"Error deleting thumbnail {photo.thumbnail_path}: {e}")

    db.delete(photo)
    db.commit()
    
    return {"message": "Photo deleted successfully"}


# ==================== NATIONAL COORDINATOR ENDPOINTS ====================

@router.get("/coordinator/my-country-photos")
def get_coordinator_country_photos(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all photos from the coordinator's country"""
    if current_user.role != UserRole.NATIONAL_COORDINATOR:
        raise HTTPException(status_code=403, detail="Only National Coordinators can access this endpoint")
    
    if not current_user.country:
        raise HTTPException(status_code=400, detail="Coordinator does not have a country assigned")
    
    photos = db.query(Photo).filter(Photo.country == current_user.country).options(joinedload(Photo.owner)).all()
    
    photos_data = []
    for p in photos:
        photo_scores = db.query(Score).filter(Score.photo_id == p.id).all()
        vote_count = len(photo_scores)
        if vote_count > 0:
            avg_score = round(sum(
                ((s.impact or 0) + (s.technique or 0) + (s.composition or 0) + (s.story or 0)) / 4 
                for s in photo_scores
            ) / vote_count, 1)
        else:
            avg_score = 0
        
        photos_data.append({
            "id": p.id,
            "title": p.title if p.title else "Sin Título",
            "description": p.description,
            "file_path": p.file_path,
            "category": p.category if p.category else "General",
            "country": p.country,
            "author": p.owner.full_name if p.owner else "Anónimo",
            "author_email": p.owner.email if p.owner else None,
            "created_at": p.created_at.isoformat() if p.created_at else None,
            "avg_score": avg_score,
            "vote_count": vote_count
        })
    
    return {
        "country": current_user.country,
        "total_photos": len(photos_data),
        "photos": photos_data
    }


@router.get("/coordinator/stats")
def get_coordinator_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get statistics for the coordinator's country"""
    if current_user.role != UserRole.NATIONAL_COORDINATOR:
        raise HTTPException(status_code=403, detail="Only National Coordinators can access this endpoint")
    
    if not current_user.country:
        raise HTTPException(status_code=400, detail="Coordinator does not have a country assigned")
    
    country = current_user.country
    
    # Total photos from this country
    total_photos = db.query(Photo).filter(Photo.country == country).count()
    
    # Total participants from this country
    total_participants = db.query(User).filter(
        User.country == country, 
        User.role == UserRole.PARTICIPANT
    ).count()
    
    # Category distribution for this country
    categories = db.query(Photo.category, func.count(Photo.id)).filter(
        Photo.country == country
    ).group_by(Photo.category).all()
    category_data = [{"name": (c[0] if c[0] else "Sin Categoría"), "value": c[1]} for c in categories]
    
    # Top 5 photos from this country
    photos = db.query(Photo).filter(Photo.country == country).all()
    leaderboard = []
    for p in photos:
        photo_scores = db.query(Score).filter(Score.photo_id == p.id).all()
        if photo_scores:
            avg_score = round(sum(
                ((s.impact or 0) + (s.technique or 0) + (s.composition or 0) + (s.story or 0)) / 4 
                for s in photo_scores
            ) / len(photo_scores), 1)
        else:
            avg_score = 0
        
        leaderboard.append({
            "id": p.id,
            "title": p.title if p.title else "Sin Título",
            "author": p.owner.full_name if p.owner else "Anónimo",
            "score": avg_score,
            "category": p.category if p.category else "General"
        })
    
    leaderboard = sorted(leaderboard, key=lambda x: x["score"], reverse=True)[:5]
    
    return {
        "country": country,
        "total_photos": total_photos,
        "total_participants": total_participants,
        "category_data": category_data,
        "leaderboard": leaderboard
    }


@router.post("/coordinator/upload")
async def coordinator_upload_photo(
    file: UploadFile = File(...),
    title: str = Form(...),
    description: str = Form(""),
    category: str = Form("Nature"),
    participant_email: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Coordinators can upload photos on behalf of participants from their country"""
    if current_user.role != UserRole.NATIONAL_COORDINATOR:
        raise HTTPException(status_code=403, detail="Only National Coordinators can use this endpoint")
    
    if not current_user.country:
        raise HTTPException(status_code=400, detail="Coordinator does not have a country assigned")
    
    # Find or create participant
    participant = db.query(User).filter(User.email == participant_email).first()
    
    if participant:
        # Check the participant is from the same country or has no country
        if participant.country and participant.country != current_user.country:
            raise HTTPException(
                status_code=400, 
                detail=f"Participant is from {participant.country}, not {current_user.country}"
            )
        # Update participant's country if not set
        if not participant.country:
            participant.country = current_user.country
            db.commit()
    else:
        # Create a new participant for this country
        from app.core.security import get_password_hash
        import secrets
        temp_password = secrets.token_urlsafe(12)
        participant = User(
            email=participant_email,
            hashed_password=get_password_hash(temp_password),
            country=current_user.country,
            role=UserRole.PARTICIPANT,
            full_name=participant_email.split("@")[0]
        )
        db.add(participant)
        db.commit()
        db.refresh(participant)
    
    # Save the photo
    file_path = os.path.join(UPLOAD_DIR, file.filename).replace("\\", "/")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    new_photo = Photo(
        title=title, 
        description=description, 
        category=category, 
        file_path=file_path,
        country=current_user.country,
        owner_id=participant.id
    )
    db.add(new_photo)
    db.commit()

    return {
        "id": new_photo.id,
        "filename": file.filename,
        "title": title,
        "category": category,
        "country": current_user.country,
        "participant_email": participant_email,
        "message": "Photo uploaded successfully for your country"
    }


@router.delete("/coordinator/remove/{photo_id}")
def coordinator_delete_photo(
    photo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Coordinators can delete photos from their country"""
    if current_user.role != UserRole.NATIONAL_COORDINATOR:
        raise HTTPException(status_code=403, detail="Only National Coordinators can use this endpoint")
    
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    
    # Check the photo belongs to coordinator's country
    if photo.country != current_user.country:
        raise HTTPException(
            status_code=403, 
            detail=f"This photo belongs to {photo.country}, not your country ({current_user.country})"
        )
    
    # Delete files
    if photo.file_path and os.path.exists(photo.file_path):
        try:
            os.remove(photo.file_path)
        except Exception as e:
            print(f"Error deleting file {photo.file_path}: {e}")
            
    if photo.thumbnail_path and os.path.exists(photo.thumbnail_path):
        try:
            os.remove(photo.thumbnail_path)
        except Exception as e:
            print(f"Error deleting thumbnail {photo.thumbnail_path}: {e}")

    db.delete(photo)
    db.commit()
    
    return {"message": f"Photo deleted successfully from {current_user.country}"}


@router.get("/coordinator/participants")
def get_coordinator_participants(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all participants from the coordinator's country"""
    if current_user.role != UserRole.NATIONAL_COORDINATOR:
        raise HTTPException(status_code=403, detail="Only National Coordinators can access this endpoint")
    
    if not current_user.country:
        raise HTTPException(status_code=400, detail="Coordinator does not have a country assigned")
    
    participants = db.query(User).filter(
        User.country == current_user.country,
        User.role == UserRole.PARTICIPANT
    ).all()
    
    participants_data = []
    for p in participants:
        photo_count = db.query(Photo).filter(Photo.owner_id == p.id).count()
        participants_data.append({
            "id": p.id,
            "email": p.email,
            "full_name": p.full_name if p.full_name else "Sin Nombre",
            "mensa_number": p.mensa_number,
            "photo_count": photo_count
        })
    
    return {
        "country": current_user.country,
        "total_participants": len(participants_data),
        "participants": participants_data
    }
