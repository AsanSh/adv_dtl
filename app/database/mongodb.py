from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")

client = AsyncIOMotorClient(MONGODB_URL)
db = client.dtl_db

# Collections
users_collection = db.users
organizations_collection = db.organizations
applications_collection = db.applications 