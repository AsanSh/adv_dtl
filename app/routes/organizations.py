from fastapi import APIRouter, HTTPException, Depends
from app.models.organization import Organization, OrganizationCreate
from app.models.user import UserRole
from app.database.mongodb import organizations_collection, users_collection
from app.dependencies import get_current_user
from bson import ObjectId
import secrets
from typing import List
from datetime import datetime

router = APIRouter()

def generate_join_code():
    return secrets.token_urlsafe(8)

@router.post("/", response_model=Organization)
async def create_organization(
    organization: OrganizationCreate,
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can create organizations")
    
    # Generate unique join code
    join_code = generate_join_code()
    while await organizations_collection.find_one({"join_code": join_code}):
        join_code = generate_join_code()
    
    org_dict = organization.dict()
    org_dict["_id"] = str(ObjectId())
    org_dict["admin_id"] = current_user["_id"]
    org_dict["join_code"] = join_code
    org_dict["created_at"] = datetime.utcnow()
    
    result = await organizations_collection.insert_one(org_dict)
    org_dict["id"] = str(result.inserted_id)
    
    # Update user's company_id
    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"company_id": org_dict["id"]}}
    )
    
    return Organization(**org_dict)

@router.get("/{org_id}", response_model=Organization)
async def get_organization(org_id: str, current_user: dict = Depends(get_current_user)):
    organization = await organizations_collection.find_one({"_id": org_id})
    if not organization:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    if current_user["company_id"] != org_id and current_user["role"] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to view this organization")
    
    return Organization(**organization)

@router.post("/join/{join_code}")
async def join_organization(
    join_code: str,
    current_user: dict = Depends(get_current_user)
):
    organization = await organizations_collection.find_one({"join_code": join_code})
    if not organization:
        raise HTTPException(status_code=404, detail="Invalid join code")
    
    # Update user's company_id
    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"company_id": organization["_id"]}}
    )
    
    # Add user to organization members
    await organizations_collection.update_one(
        {"_id": organization["_id"]},
        {"$addToSet": {"members": current_user["_id"]}}
    )
    
    return {"message": "Successfully joined organization"}

@router.get("/", response_model=List[Organization])
async def list_organizations(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can list all organizations")
    
    organizations = []
    async for org in organizations_collection.find():
        organizations.append(Organization(**org))
    return organizations 