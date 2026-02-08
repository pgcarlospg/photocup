from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, photos, analytics

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(photos.router, prefix="/photos", tags=["photos"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
# Submissions, scoring, admin routers would be added here
