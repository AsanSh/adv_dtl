from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

class ApplicationStatus(str, Enum):
    ACTIVE = "active"
    CLOSED = "closed"
    CANCELLED = "cancelled"

class ApplicationBase(BaseModel):
    title: str
    description: str
    cargo_info: str
    route: str
    status: ApplicationStatus = ApplicationStatus.ACTIVE
    company_id: str
    created_by: str  # user_id of the logist
    assigned_driver: Optional[str] = None  # user_id of the driver

class ApplicationCreate(ApplicationBase):
    pass

class Application(ApplicationBase):
    id: str
    created_at: datetime
    closed_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None

    class Config:
        from_attributes = True 