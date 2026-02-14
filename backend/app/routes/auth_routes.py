"""Authentication endpoints: register and login."""
from fastapi import APIRouter, HTTPException, status
from app.schemas.user_schema import UserRegister, UserLogin, UserOut, Token
from app.utils.auth_utils import hash_password, verify_password, create_token
from app.services.storage_service import create_user, get_user_by_email

router = APIRouter()


@router.post("/register", response_model=Token)
async def register(user_data: UserRegister):
    """
    Register a new user.
    
    Returns JWT token on success.
    """
    # Check if user already exists
    existing = get_user_by_email(user_data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Hash password
    hashed_pw = hash_password(user_data.password)
    
    # Create user in storage
    user = create_user(
        email=user_data.email,
        hashed_password=hashed_pw,
        name=user_data.name,
        role="user",
    )
    
    # Generate token
    token = create_token({"sub": user["id"]})
    
    # Remove sensitive data before returning
    user_out = UserOut(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        role=user["role"],
    )
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_out,
    }


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    """
    Login with email and password.
    
    Returns JWT token on success.
    """
    # Find user
    user = get_user_by_email(credentials.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    
    # Verify password
    if not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    
    # Generate token
    token = create_token({"sub": user["id"]})
    
    # Return safe user data
    user_out = UserOut(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        role=user["role"],
    )
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_out,
    }
