from pydantic import BaseModel
from typing import Optional, List

class OrganizationBase(BaseModel):
    name: str
    contact_info: str
    join_code: str

class OrganizationCreate(OrganizationBase):
    pass

class Organization(OrganizationBase):
    id: str
    admin_id: str
    members: List[str] = []

    class Config:
        from_attributes = True 