from sqlalchemy import Column, Integer, String, Enum, Boolean
from app.db.session import Base
import enum

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    PARTICIPANT = "PARTICIPANT"
    JUDGE = "JUDGE"
    NATIONAL_COORDINATOR = "NATIONAL_COORDINATOR"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(Enum(UserRole), default=UserRole.PARTICIPANT)
    
    # Specific Participant data
    country = Column(String)
    mensa_number = Column(String)
    
    is_active = Column(Boolean(), default=True)
