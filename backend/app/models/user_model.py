from pydantic import BaseModel, EmailStr
from typing import Optional


class UserInDB(BaseModel):
    id: Optional[str]
    email: EmailStr
    hashed_password: str
    name: Optional[str]


# TODO: Add ODM/mapper if desired. This is a minimal placeholder model.
