from fastapi import APIRouter, Depends
from app.db.session import get_db
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.user import User, UserRole
from app.models.photo import Photo, Score

router = APIRouter()

@router.get("/admin/summary")
def get_admin_summary(db: Session = Depends(get_db)):
    # Need user role verification dependency here
    total_users = db.query(User).count()
    total_photos = db.query(Photo).count()
    total_countries = db.query(Photo.country).distinct().count()
    
    return {
        "total_users": total_users,
        "total_photos": total_photos,
        "total_countries": total_countries,
        "status": "success"
    }

@router.get("/judge/pending")
def get_judge_pending(db: Session = Depends(get_db)):
    # Mock for now
    return {"pending": 10, "evaluated": 5}
