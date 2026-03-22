/**
 * API client for the PhotoCup FastAPI backend (port 5001).
 * All calls automatically attach the JWT Bearer token from localStorage.
 */

// All browser requests go through the Next.js proxy (rewrites in next.config.ts).
// Never call the backend directly from the browser — avoids mixed-content and
// cross-origin issues when the app is served over HTTPS.
export const BACKEND_URL = '';   // relative — proxy handles the real backend URL
const API_BASE = '/api/v1';

// ─── Token helpers ────────────────────────────────────────────────────────────

export function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('pc_token');
}

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
    const token = getToken();
    return {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...extra,
    };
}

async function req<T>(
    method: string,
    path: string,
    body?: unknown,
    isFormData = false,
): Promise<T> {
    const headers: Record<string, string> = authHeaders(
        isFormData ? {} : { 'Content-Type': 'application/json' },
    );

    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: isFormData
            ? (body as FormData)
            : body !== undefined
            ? JSON.stringify(body)
            : undefined,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail ?? 'Request failed');
    }

    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginResponse {
    access_token: string;
    token_type: string;
    user: {
        email: string;
        role: string;
        full_name: string;
        country: string | null;
    };
}

export async function apiLogin(email: string, password: string): Promise<LoginResponse> {
    const form = new URLSearchParams();
    form.append('username', email);
    form.append('password', password);

    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Invalid credentials' }));
        throw new Error(err.detail ?? 'Login failed');
    }
    return res.json();
}

// ─── Users ────────────────────────────────────────────────────────────────────

export interface ApiUser {
    id: number;
    email: string;
    full_name: string;
    role: string;
    country: string | null;
    mensa_number: string | null;
    is_active: boolean;
}

export interface UserCreatePayload {
    email: string;
    password: string;
    full_name: string;
    role: string;
    country?: string;
    mensa_number?: string;
}

export interface UserUpdatePayload {
    email?: string;
    password?: string;
    full_name?: string;
    role?: string;
    country?: string;
    mensa_number?: string;
    is_active?: boolean;
}

export const apiGetUsers = (): Promise<ApiUser[]> =>
    req('GET', '/users/');

export const apiCreateUser = (data: UserCreatePayload): Promise<ApiUser> =>
    req('POST', '/users/', data);

export const apiUpdateUser = (id: number, data: UserUpdatePayload): Promise<ApiUser> =>
    req('PUT', `/users/${id}`, data);

export const apiDeleteUser = (id: number): Promise<void> =>
    req('DELETE', `/users/${id}`);

// ─── Photos ───────────────────────────────────────────────────────────────────

export interface ApiPhoto {
    id: number;
    title: string | null;
    description: string | null;
    file_path: string | null;
    thumbnail_path: string | null;
    category: string | null;
    country: string | null;
    owner_id: number;
    created_at: string | null;
    owner?: { full_name: string; email: string };
}

export interface PhotoStats {
    total_photos: number;
    total_participants: number;
    total_scores: number;
    category_data: { name: string; value: number }[];
    country_data: { name: string; Participantes: number }[];
    leaderboard: {
        id: number;
        title: string;
        author: string;
        score: number;
        category: string;
        judgeScores: { name: string; score: number }[];
    }[];
    detailed_ranking: {
        id: number;
        title: string;
        author: string;
        category: string;
        country: string;
        total_points: number;
        vote_count: number;
        avg_score: number;
    }[];
    judge_performance: { name: string; reviews: number; avgScore: number }[];
}

export const apiGetPhotos = (): Promise<ApiPhoto[]> =>
    req('GET', '/photos/');

export interface MyPhoto {
    id: number;
    title: string | null;
    description: string | null;
    file_path: string | null;
    category: string | null;
    country: string | null;
    created_at: string | null;
}

export const apiGetMyPhotos = (): Promise<MyPhoto[]> =>
    req('GET', '/photos/my');

export interface MyEvaluation {
    score_id: number;
    photo_id: number;
    photo_title: string | null;
    photo_category: string | null;
    photo_file_path: string | null;
    impact: number;
    story: number;
    creativity: number;
    composition: number;
    technique: number;
    total_score: number;
    comment: string | null;
    created_at: string | null;
}

export const apiGetMyEvaluations = (): Promise<MyEvaluation[]> =>
    req('GET', '/photos/my-evaluations');

export const apiDeleteMyPhoto = (id: number): Promise<void> =>
    req('DELETE', `/photos/my/${id}`);

export const apiGetStats = (): Promise<PhotoStats> =>
    req('GET', '/photos/stats');

export async function apiUploadPhoto(
    file: File,
    title: string,
    description: string,
    category: string,
): Promise<{ id: number; filename: string; title: string; category: string; message: string }> {
    const form = new FormData();
    form.append('file', file);
    form.append('title', title);
    form.append('description', description);
    form.append('category', category);
    return req('POST', '/photos/upload', form, true);
}

export async function apiScorePhoto(
    photoId: number,
    scores: { impact: number; story: number; creativity: number; composition: number; technique: number; comment?: string },
): Promise<{ status: string; total_score: number }> {
    const form = new FormData();
    form.append('impact', String(scores.impact));
    form.append('story', String(scores.story));
    form.append('creativity', String(scores.creativity));
    form.append('composition', String(scores.composition));
    form.append('technique', String(scores.technique));
    form.append('comment', scores.comment ?? '');
    return req('POST', `/photos/${photoId}/score`, form, true);
}

export const apiDeletePhoto = (id: number): Promise<void> =>
    req('DELETE', `/photos/remove-item/${id}`);

export const apiGenerateThumbs = (): Promise<{ generated: number; skipped: number; errors: number }> =>
    req('POST', '/photos/generate-thumbs');

// ─── Governance / Analytics ───────────────────────────────────────────────────

export interface GovernanceMetrics {
    participation: {
        total_participants: number;
        total_photos: number;
        total_judges: number;
        total_coordinators: number;
        total_countries: number;
        total_categories: number;
        avg_photos_per_participant: number;
        country_distribution: { country: string; participants: number; photos: number; avg_photos_per_participant: number }[];
        countries_without_photos: { country: string; participants: number; photos: number }[];
        category_distribution: { category: string; photos: number; participants: number; avg_photos: number }[];
        saturated_categories: string[];
        underrepresented_categories: string[];
        funnel: { registered_users: number; submitted_at_least_one: number; not_submitted: number; submission_rate_pct: number; abandonment_rate_pct: number };
    };
    operational: {
        photos_pending_review: number;
        photos_with_scores: number;
        photos_no_exif_metadata: number;
        avg_file_size_mb: number;
        max_file_size_mb: number;
        users_by_role: Record<string, number>;
        active_users: number;
        inactive_users: number;
    };
    judging: {
        judge_metrics: {
            judge_id: number; judge_name: string; country: string | null;
            photos_reviewed: number; pct_complete: number; avg_score: number; stddev: number;
            min_score: number; max_score: number; score_range: number;
            distribution: { low: number; mid: number; high: number };
            criteria_avgs: { impact: number; technique: number; composition: number; story: number };
        }[];
        global_judge_mean: number;
        global_judge_stddev: number;
        outlier_judges: { judge_name: string; avg_score: number; z_score: number; label: string }[];
        repetitive_judges: { judge_name: string; unique_scores: number; total_reviews: number }[];
        avg_inter_judge_disagreement: number;
        extreme_disagreement_photos: { photo_id: number; photo_title: string; category: string; country: string; num_judges: number; avg_score: number; stddev: number; spread: number }[];
        photos_with_min_2_judges: number;
        pct_min_2_coverage: number;
        category_scores: { category: string; num_photos_scored: number; avg_score: number; stddev: number }[];
    };
    results: {
        top_10: { photo_id: number; photo_title: string; category: string; country: string; num_judges: number; avg_score: number; stddev: number; spread: number }[];
        top_country_distribution: { country: string; count: number }[];
        countries_in_top_10: number;
        hhi_concentration: number;
        winners_by_category: { photo_id: number; photo_title: string; category: string; country: string; avg_score: number }[];
        country_equity: { country: string; photos: number; participants: number; top10_count: number; participation_share_pct: number; prize_share_pct: number }[];
    };
    available_countries: string[];
    active_country_filter: string | null;
}

export const apiGetGovernanceMetrics = (country?: string): Promise<GovernanceMetrics> =>
    req('GET', country ? `/analytics/governance?country=${encodeURIComponent(country)}` : '/analytics/governance');

// ─── Coordinator ──────────────────────────────────────────────────────────────

export interface CoordinatorPhoto {
    id: number;
    title: string;
    description: string | null;
    file_path: string | null;
    category: string;
    country: string;
    author: string;
    author_email: string | null;
    created_at: string | null;
    avg_score: number;
    vote_count: number;
}

export interface CoordinatorStats {
    country: string;
    total_photos: number;
    total_participants: number;
    category_data: { name: string; value: number }[];
    leaderboard: { id: number; title: string; author: string; score: number; category: string }[];
}

export interface CoordinatorParticipant {
    id: number;
    email: string;
    full_name: string;
    mensa_number: string | null;
    photo_count: number;
}

export const apiGetCoordinatorPhotos = (): Promise<{ country: string; total_photos: number; photos: CoordinatorPhoto[] }> =>
    req('GET', '/photos/coordinator/my-country-photos');

export const apiGetCoordinatorStats = (): Promise<CoordinatorStats> =>
    req('GET', '/photos/coordinator/stats');

export const apiGetCoordinatorParticipants = (): Promise<{ country: string; total_participants: number; participants: CoordinatorParticipant[] }> =>
    req('GET', '/photos/coordinator/participants');

export async function apiCoordinatorUpload(
    file: File,
    title: string,
    description: string,
    category: string,
    participantEmail: string,
): Promise<unknown> {
    const form = new FormData();
    form.append('file', file);
    form.append('title', title);
    form.append('description', description);
    form.append('category', category);
    form.append('participant_email', participantEmail);
    return req('POST', '/photos/coordinator/upload', form, true);
}

export const apiCoordinatorDeletePhoto = (id: number): Promise<void> =>
    req('DELETE', `/photos/coordinator/remove/${id}`);

// ─── Photo URL helper ─────────────────────────────────────────────────────────

/** Converts a backend file_path like "uploads/foo.jpg" to a proxy-relative URL */
export function photoUrl(filePath: string | null): string | null {
    if (!filePath) return null;
    if (filePath.startsWith('http')) return filePath;
    // Strip leading slash; Next.js proxy rewrites /uploads/* → backend
    return `/${filePath.replace(/^\//, '')}`;
}

// ─── Drive Sync ───────────────────────────────────────────────────────────────

export interface DriveSyncStatus {
    [filename: string]: {
        exists: boolean;
        last_synced: string | null;
        size_kb: number;
    };
}

export const apiDriveSyncTrigger = (): Promise<{ status: string; message: string }> =>
    req('POST', '/drive/sync');

export const apiDriveSyncStatus = (): Promise<DriveSyncStatus> =>
    req('GET', '/drive/status');
