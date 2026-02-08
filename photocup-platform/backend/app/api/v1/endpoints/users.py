from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User, UserRole
from app.api.deps import get_current_user
from app.core.security import get_password_hash
from typing import Optional
from pydantic import BaseModel, EmailStr

router = APIRouter()

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str  # "ADMIN", "JUDGE", "PARTICIPANT", "NATIONAL_COORDINATOR"
    country: Optional[str] = "Global"
    mensa_number: Optional[str] = ""

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[str] = None  # "ADMIN", "JUDGE", "PARTICIPANT", "NATIONAL_COORDINATOR"
    country: Optional[str] = None
    mensa_number: Optional[str] = None
    is_active: Optional[bool] = None

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    country: Optional[str] = None
    mensa_number: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True

@router.get("/", response_model=list[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all users - Admin only"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    users = db.query(User).all()
    return users

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new user - Admin only"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if user already exists
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="User with this email already exists"
        )
    
    # Map role string to enum
    role_map = {
        "ADMIN": UserRole.ADMIN,
        "JUDGE": UserRole.JUDGE,
        "PARTICIPANT": UserRole.PARTICIPANT,
        "NATIONAL_COORDINATOR": UserRole.NATIONAL_COORDINATOR
    }
    
    role = role_map.get(user_data.role.upper())
    if not role:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    # Create new user
    new_user = User(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        role=role,
        country=user_data.country,
        mensa_number=user_data.mensa_number,
        is_active=True
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a user - Admin only"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user_data.email and user_data.email != user.email:
        existing = db.query(User).filter(User.email == user_data.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="User with this email already exists")
        user.email = user_data.email

    if user_data.full_name is not None:
        user.full_name = user_data.full_name

    if user_data.role:
        role_map = {
            "ADMIN": UserRole.ADMIN,
            "JUDGE": UserRole.JUDGE,
            "PARTICIPANT": UserRole.PARTICIPANT,
            "NATIONAL_COORDINATOR": UserRole.NATIONAL_COORDINATOR
        }
        role = role_map.get(user_data.role.upper())
        if not role:
            raise HTTPException(status_code=400, detail="Invalid role")
        user.role = role

    if user_data.country is not None:
        user.country = user_data.country

    if user_data.mensa_number is not None:
        user.mensa_number = user_data.mensa_number

    if user_data.is_active is not None:
        user.is_active = user_data.is_active

    if user_data.password:
        user.hashed_password = get_password_hash(user_data.password)

    db.commit()
    db.refresh(user)

    return user

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a user - Admin only"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent deleting yourself
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    db.delete(user)
    db.commit()
    
    return {"message": "User deleted successfully"}
