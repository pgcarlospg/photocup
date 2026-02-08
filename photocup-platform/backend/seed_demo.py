import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine
from app.models.user import User, UserRole
from app.models.photo import Photo, Base
from passlib.context import CryptContext
from datetime import datetime

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed_data():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if admin exists
    admin = db.query(User).filter(User.email == "admin@photocup.com").first()
    if not admin:
        admin = User(
            email="admin@photocup.com",
            hashed_password=pwd_context.hash("admin123"),
            full_name="Admin Principal",
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(admin)
        
    # Judge
    judge = db.query(User).filter(User.email == "judge@photocup.com").first()
    if not judge:
        judge = User(
            email="judge@photocup.com",
            hashed_password=pwd_context.hash("judge123"),
            full_name="Jurado Mensa",
            role=UserRole.JUDGE,
            is_active=True
        )
        db.add(judge)
        
    # Participant
    user = db.query(User).filter(User.email == "user@photocup.com").first()
    if not user:
        user = User(
            email="user@photocup.com",
            hashed_password=pwd_context.hash("user123"),
            full_name="Participante Demo",
            role=UserRole.PARTICIPANT,
            is_active=True,
            country="Spain",
            mensa_number="ES-12345"
        )
        db.add(user)
        db.flush() # To get user.id

    # Seed some sample photos for judging
    if db.query(Photo).count() == 0:
        sample_photos = [
            Photo(
                title="The Alpine Peak", 
                description="Shot at 4000m", 
                category="Nature", 
                country="Switzerland", 
                owner_id=user.id,
                file_path="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80"
            ),
            Photo(
                title="Urban Geometry", 
                description="Shadows in Berlin", 
                category="Architecture", 
                country="Germany", 
                owner_id=user.id,
                file_path="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80"
            ),
            Photo(
                title="Silence", 
                description="A desert landscape", 
                category="Nature", 
                country="Spain", 
                owner_id=user.id,
                file_path="https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&w=800&q=80"
            ),
        ]
        db.add_all(sample_photos)
        
    db.commit()
    print("Seed data created successfully.")


if __name__ == "__main__":
    seed_data()
