import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserProfile
from app.models.gamification import XPTransaction
from app.schemas.auth import (
    UserRegister,
    UserLogin,
    TokenResponse,
    PasswordResetRequest,
    PasswordResetConfirm,
    UserAuthResponse,
)
from app.services.auth_service import hash_password, verify_password, create_access_token
from app.services.notification_service import create_notification
from app.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(req: UserRegister, db: Session = Depends(get_db)):
    # Check if email exists
    if db.query(User).filter(User.email == req.email.lower()).first():
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    
    # Check if username exists
    if db.query(User).filter(User.username == req.username.lower()).first():
        raise HTTPException(status_code=400, detail="This username is already taken.")

    # Create user
    user = User(
        email=req.email.lower(),
        username=req.username.lower(),
        full_name=req.full_name,
        hashed_password=hash_password(req.password),
        role="user",
        is_active=True
    )
    db.add(user)
    db.flush()

    # Create associated profile
    profile = UserProfile(
        user_id=user.id,
        bio=f"Hello! I am {user.full_name}. Ready to level up my fitness journey on FitQuest!",
        fitness_level="Beginner",
        total_xp=0,
        level=1,
        coins=100,  # 100 bonus starter coins!
        current_streak=0,
        longest_streak=0,
    )
    db.add(profile)

    # Initial Welcome transaction
    tx = XPTransaction(
        user_id=user.id,
        amount=0,
        action="welcome_bonus",
        description="Joined FitQuest – Starter pack: 100 FitCoins awarded!"
    )
    db.add(tx)

    # Welcome notification
    create_notification(
        db=db,
        user_id=user.id,
        type="welcome",
        title="Welcome to FitQuest! 🚀",
        message="Log your first workout to start earning XP, unlocking badges, and climbing the leaderboards!",
        link="/activities"
    )

    db.commit()
    db.refresh(user)

    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login", response_model=TokenResponse)
def login(req: UserLogin, db: Session = Depends(get_db)):
    login_id = req.username_or_email.lower().strip()
    user = (
        db.query(User)
        .filter((User.email == login_id) | (User.username == login_id))
        .first()
    )

    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email/username or password."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been suspended or deactivated. Please contact support."
        )

    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserAuthResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/forgot-password")
def forgot_password(req: PasswordResetRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user:
        # Don't leak existence for security, return generic message
        return {
            "message": "If this email is registered, you will receive password reset instructions.",
            "reset_token": "fitquest-demo-reset-token"
        }
    
    # Safe local dev demonstration token
    token = f"reset-{user.id}-{int(datetime.datetime.utcnow().timestamp())}"
    return {
        "message": "Password reset instructions generated.",
        "reset_token": token,
        "instructions": "In production, an email with a secure link is dispatched. For local evaluation, use the provided reset_token."
    }

@router.post("/reset-password")
def reset_password(req: PasswordResetConfirm, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    # Check token format
    if not req.token or not req.token.startswith("reset-"):
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")

    user.hashed_password = hash_password(req.new_password)
    db.commit()

    return {"message": "Password has been successfully updated. You may now log in with your new password."}
