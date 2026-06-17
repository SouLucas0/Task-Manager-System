from pydantic import BaseModel, EmailStr, Field


class RegisterInputSchema(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)


class LoginInputSchema(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


class UserSchema(BaseModel):
    id: int
    name: str
    email: str
    is_active: bool
    created_at: str

    model_config = {"from_attributes": True}


class AuthResponseSchema(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserSchema
