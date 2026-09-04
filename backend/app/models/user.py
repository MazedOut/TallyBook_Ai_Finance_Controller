from pydantic import BaseModel
from typing import Optional
from enum import Enum

class UserRole(str, Enum):
    ANALYST = "analyst"
    CONTROLLER = "controller"
    AUDITOR = "auditor"
    ADMIN = "admin"

class User(BaseModel):
    id: str
    username: str
    email: str
    full_name: str
    role: UserRole
    hashed_password: str
    avatar_initials: str
    department: str = "Finance & Accounting"

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    full_name: str
    role: UserRole
    avatar_initials: str
    department: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
