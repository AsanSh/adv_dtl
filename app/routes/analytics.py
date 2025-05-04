from fastapi import APIRouter, HTTPException, Depends
from app.models.application import ApplicationStatus
from app.database.mongodb import applications_collection, users_collection
from app.dependencies import get_current_user
from datetime import datetime, timedelta
from typing import Dict, List

router = APIRouter()

@router.get("/applications")
async def get_application_stats(
    start_date: datetime = None,
    end_date: datetime = None,
    current_user: dict = Depends(get_current_user)
):
    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=30)
    if not end_date:
        end_date = datetime.utcnow()
    
    pipeline = [
        {
            "$match": {
                "company_id": current_user["company_id"],
                "created_at": {"$gte": start_date, "$lte": end_date}
            }
        },
        {
            "$group": {
                "_id": "$status",
                "count": {"$sum": 1}
            }
        }
    ]
    
    stats = {}
    async for doc in applications_collection.aggregate(pipeline):
        stats[doc["_id"]] = doc["count"]
    
    return {
        "total": sum(stats.values()),
        "active": stats.get(ApplicationStatus.ACTIVE, 0),
        "closed": stats.get(ApplicationStatus.CLOSED, 0),
        "cancelled": stats.get(ApplicationStatus.CANCELLED, 0)
    }

@router.get("/drivers")
async def get_driver_stats(
    start_date: datetime = None,
    end_date: datetime = None,
    current_user: dict = Depends(get_current_user)
):
    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=30)
    if not end_date:
        end_date = datetime.utcnow()
    
    pipeline = [
        {
            "$match": {
                "company_id": current_user["company_id"],
                "assigned_driver": {"$exists": True},
                "created_at": {"$gte": start_date, "$lte": end_date}
            }
        },
        {
            "$group": {
                "_id": "$assigned_driver",
                "total_applications": {"$sum": 1},
                "completed_applications": {
                    "$sum": {
                        "$cond": [{"$eq": ["$status", ApplicationStatus.CLOSED]}, 1, 0]
                    }
                }
            }
        }
    ]
    
    driver_stats = []
    async for doc in applications_collection.aggregate(pipeline):
        driver = await users_collection.find_one({"_id": doc["_id"]})
        if driver:
            driver_stats.append({
                "driver_name": f"{driver.get('first_name', '')} {driver.get('last_name', '')}",
                "total_applications": doc["total_applications"],
                "completed_applications": doc["completed_applications"],
                "completion_rate": (doc["completed_applications"] / doc["total_applications"] * 100) if doc["total_applications"] > 0 else 0
            })
    
    return driver_stats

@router.get("/logists")
async def get_logist_stats(
    start_date: datetime = None,
    end_date: datetime = None,
    current_user: dict = Depends(get_current_user)
):
    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=30)
    if not end_date:
        end_date = datetime.utcnow()
    
    pipeline = [
        {
            "$match": {
                "company_id": current_user["company_id"],
                "created_by": {"$exists": True},
                "created_at": {"$gte": start_date, "$lte": end_date}
            }
        },
        {
            "$group": {
                "_id": "$created_by",
                "total_applications": {"$sum": 1},
                "active_applications": {
                    "$sum": {
                        "$cond": [{"$eq": ["$status", ApplicationStatus.ACTIVE]}, 1, 0]
                    }
                }
            }
        }
    ]
    
    logist_stats = []
    async for doc in applications_collection.aggregate(pipeline):
        logist = await users_collection.find_one({"_id": doc["_id"]})
        if logist:
            logist_stats.append({
                "logist_name": f"{logist.get('first_name', '')} {logist.get('last_name', '')}",
                "total_applications": doc["total_applications"],
                "active_applications": doc["active_applications"]
            })
    
    return logist_stats 