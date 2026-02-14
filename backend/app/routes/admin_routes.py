"""Admin endpoints: register/login and analytics/debate management."""
from fastapi import APIRouter, Depends, HTTPException, status
from app.utils.auth_utils import get_current_admin, hash_password, verify_password, create_token
from app.services.storage_service import (
    get_debate_stats,
    get_user_by_id,
    get_all_debates,
    delete_debate,
    get_user_by_email,
    create_user,
)
from app.schemas.user_schema import UserRegister, UserLogin, UserOut, Token

router = APIRouter()


@router.post("/register", response_model=Token)
async def admin_register(payload: UserRegister):
    """Create an admin account (can be used once to seed admin)."""
    existing = get_user_by_email(payload.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    hashed = hash_password(payload.password)
    user = create_user(email=payload.email, hashed_password=hashed, name=payload.name, role="admin")
    token = create_token({"sub": user["id"]})

    user_out = UserOut(id=user["id"], email=user["email"], name=user["name"], role=user["role"]) 
    return {"access_token": token, "token_type": "bearer", "user": user_out}


@router.post("/login", response_model=Token)
async def admin_login(credentials: UserLogin):
    """Admin login endpoint."""
    user = get_user_by_email(credentials.email)
    if not user or user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_token({"sub": user["id"]})
    user_out = UserOut(id=user["id"], email=user["email"], name=user["name"], role=user["role"]) 
    return {"access_token": token, "token_type": "bearer", "user": user_out}


@router.get("/analytics")
async def get_analytics(admin: dict = Depends(get_current_admin)):
    """Get platform analytics (admin only)."""
    stats = get_debate_stats()

    most_active_user = None
    if stats.get("most_active_user_id"):
        user = get_user_by_id(stats["most_active_user_id"])
        if user:
            most_active_user = {"id": user["id"], "name": user["name"], "email": user["email"]}

    most_voted_debate = stats.get("most_voted_debate")

    return {
        "total_users": stats["total_users"],
        "total_debates": stats["total_debates"],
        "most_voted_debate": most_voted_debate,
        "most_active_user": most_active_user,
    }


@router.get("/debates")
async def admin_list_debates(admin: dict = Depends(get_current_admin)):
    """List all debates (admin only)."""
    return {"debates": get_all_debates()}


@router.delete("/debates/{debate_id}")
async def admin_delete_debate(debate_id: str, admin: dict = Depends(get_current_admin)):
    """Delete any debate by id (admin only)."""
    success = delete_debate(debate_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Debate not found")
    return {"message": "Debate deleted"}
