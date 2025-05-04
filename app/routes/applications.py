from fastapi import APIRouter, HTTPException, Depends
from app.models.application import Application, ApplicationCreate, ApplicationStatus
from app.models.user import UserRole
from app.database.mongodb import applications_collection, users_collection
from app.dependencies import get_current_user
from bson import ObjectId
from datetime import datetime
from typing import List

router = APIRouter()

@router.post("/", response_model=Application)
async def create_application(
    application: ApplicationCreate,
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != UserRole.LOGIST:
        raise HTTPException(status_code=403, detail="Only logists can create applications")
    
    app_dict = application.dict()
    app_dict["_id"] = str(ObjectId())
    app_dict["created_at"] = datetime.utcnow()
    app_dict["created_by"] = current_user["_id"]
    
    result = await applications_collection.insert_one(app_dict)
    app_dict["id"] = str(result.inserted_id)
    return Application(**app_dict)

@router.get("/", response_model=List[Application])
async def list_applications(
    status: ApplicationStatus = None,
    current_user: dict = Depends(get_current_user)
):
    query = {"company_id": current_user["company_id"]}
    if status:
        query["status"] = status
    
    applications = []
    async for app in applications_collection.find(query):
        applications.append(Application(**app))
    return applications

@router.put("/{app_id}/status")
async def update_application_status(
    app_id: str,
    status: ApplicationStatus,
    current_user: dict = Depends(get_current_user)
):
    application = await applications_collection.find_one({"_id": app_id})
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if current_user["company_id"] != application["company_id"]:
        raise HTTPException(status_code=403, detail="Not authorized to update this application")
    
    update_data = {"status": status}
    if status == ApplicationStatus.CLOSED:
        update_data["closed_at"] = datetime.utcnow()
    elif status == ApplicationStatus.CANCELLED:
        update_data["cancelled_at"] = datetime.utcnow()
    
    result = await applications_collection.update_one(
        {"_id": app_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")
    
    return {"message": f"Application status updated to {status}"}

@router.put("/{app_id}/assign-driver")
async def assign_driver(
    app_id: str,
    driver_id: str,
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != UserRole.LOGIST:
        raise HTTPException(status_code=403, detail="Only logists can assign drivers")
    
    # Verify driver exists and belongs to the same company
    driver = await users_collection.find_one({
        "_id": driver_id,
        "role": UserRole.DRIVER,
        "company_id": current_user["company_id"]
    })
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    result = await applications_collection.update_one(
        {"_id": app_id},
        {"$set": {"assigned_driver": driver_id}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")
    
    return {"message": "Driver assigned successfully"}

@router.get("/driver/assigned", response_model=List[Application])
async def get_driver_applications(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.DRIVER:
        raise HTTPException(status_code=403, detail="Only drivers can view assigned applications")
    
    applications = []
    async for app in applications_collection.find({
        "assigned_driver": current_user["_id"],
        "status": ApplicationStatus.ACTIVE
    }):
        applications.append(Application(**app))
    return applications 