from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime

# Auth Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: UUID
    email: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Exercise Schemas
class ExerciseCreate(BaseModel):
    title: str
    statement: str
    answer: str
    difficulty: str
    subject: str

class ExerciseUpdate(BaseModel):
    title: Optional[str] = None
    statement: Optional[str] = None
    answer: Optional[str] = None
    difficulty: Optional[str] = None
    subject: Optional[str] = None

class ExerciseResponse(BaseModel):
    id: UUID
    title: str
    statement: str
    answer: str
    difficulty: str
    subject: str
    created_by: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True
