from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.models.user import User, UserCreate, UserRole
from app.database.mongodb import users_collection
from app.dependencies import get_current_user, create_access_token
from bson import ObjectId
import bcrypt
from datetime import datetime, timedelta
from typing import List

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@router.post("/register", response_model=User)
async def register_user(user: UserCreate):
    # Check if user already exists
    existing_user = await users_collection.find_one({"username": user.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already registered")
    
    # Create new user
    user_dict = user.dict()
    user_dict["_id"] = str(ObjectId())
    user_dict["created_at"] = datetime.utcnow()
    
    result = await users_collection.insert_one(user_dict)
    user_dict["id"] = str(result.inserted_id)
    return User(**user_dict)

@router.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await users_collection.find_one({"username": form_data.username})
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    if not bcrypt.checkpw(form_data.password.encode(), user["password"].encode()):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    access_token = create_access_token(data={"sub": user["username"]})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=User)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return User(**current_user)

@router.get("/company/{company_id}", response_model=List[User])
async def get_company_users(company_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["company_id"] != company_id and current_user["role"] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to view company users")
    
    users = []
    async for user in users_collection.find({"company_id": company_id}):
        users.append(User(**user))
    return users

@router.put("/{user_id}/role")
async def update_user_role(
    user_id: str,
    new_role: UserRole,
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can change roles")
    
    result = await users_collection.update_one(
        {"_id": user_id},
        {"$set": {"role": new_role}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Role updated successfully"} 