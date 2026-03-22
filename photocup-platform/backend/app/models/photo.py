from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, JSON
from sqlalchemy.orm import relationship
from app.db.session import Base
from datetime import datetime

class Photo(Base):
    __tablename__ = "photos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    file_path = Column(String)  # MinIO path
    thumbnail_path = Column(String)
    mime_type = Column(String)
    file_size = Column(Integer)
    
    owner_id = Column(Integer, ForeignKey("users.id"))
    country = Column(String)
    category = Column(String)
    
    metadata_exif = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    owner = relationship("User", backref="photos")
    scores = relationship("Score", back_populates="photo", cascade="all, delete-orphan")

class Score(Base):
    __tablename__ = "scores"

    id = Column(Integer, primary_key=True, index=True)
    photo_id = Column(Integer, ForeignKey("photos.id"))
    judge_id = Column(Integer, ForeignKey("users.id"))
    
    # Judging criteria — PhotoCup 2025/2026
    impact = Column(Integer)       # Relevance to Theme
    story = Column(Integer)        # Emotional Impact
    creativity = Column(Integer)   # Creativity & Original Vision
    composition = Column(Integer)  # Composition & Visual Balance
    technique = Column(Integer)    # Technical Execution

    total_score = Column(Float)
    comment = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    photo = relationship("Photo", back_populates="scores")
    judge = relationship("User", backref="given_scores")
