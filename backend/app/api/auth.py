from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from app.models.user import UserResponse, Token
from app.middleware.auth import verify_password, create_access_token, get_current_user
from app.repository.memory import repo

router = APIRouter(prefix="/auth", tags=["Auth"])

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login", response_model=Token)
async def login(req: LoginRequest):
    user = repo.get_user_by_username(req.username)
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.username, "role": user.role.value})
    user_resp = UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        avatar_initials=user.avatar_initials,
        department=user.department
    )
    return Token(access_token=access_token, token_type="bearer", user=user_resp)

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(user = Depends(get_current_user)):
    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        avatar_initials=user.avatar_initials,
        department=user.department
    )

@router.get("/demo-accounts")
async def get_demo_accounts():
    """Returns pre-seeded demo accounts for one-click switching."""
    return [
        {
            "username": "analyst",
            "full_name": "Sarah Chen",
            "role": "analyst",
            "title": "Senior Financial Analyst",
            "department": "Operations Accounting",
            "description": "Runs batch recon, verifies AI reasoning traces, logs manual overrides.",
            "avatar_initials": "SC"
        },
        {
            "username": "controller",
            "full_name": "Marcus Vance",
            "role": "controller",
            "title": "Corporate Controller",
            "department": "Financial Controller Office",
            "description": "Authorizes high-value exceptions, approves adjustments, locks accounting periods.",
            "avatar_initials": "MV"
        },
        {
            "username": "auditor",
            "full_name": "Elena Rostova",
            "role": "auditor",
            "title": "Lead Statutory Auditor",
            "department": "Deloitte External Audit",
            "description": "Read-only inspection of immutable audit log, model calibration, and proof traces.",
            "avatar_initials": "ER"
        },
        {
            "username": "admin",
            "full_name": "Alex Mercer",
            "role": "admin",
            "title": "Chief Systems Architect",
            "department": "IT & Enterprise Systems",
            "description": "Configures tolerance rules, confidence cutoffs, and entity GL mappings.",
            "avatar_initials": "AM"
        }
    ]
