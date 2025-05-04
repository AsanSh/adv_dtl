from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import logging
import traceback

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(title="DTL Logistics Platform")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
@app.on_event("startup")
async def startup_db_client():
    try:
        mongodb_url = os.getenv("MONGO_URI")
        if not mongodb_url:
            raise ValueError("MONGO_URI environment variable is not set")
        
        app.mongodb_client = AsyncIOMotorClient(mongodb_url)
        app.mongodb = app.mongodb_client.dtl_db
        logger.info("Successfully connected to MongoDB")
    except Exception as e:
        logger.error(f"Error connecting to MongoDB: {str(e)}")
        logger.error(traceback.format_exc())
        raise

@app.on_event("shutdown")
async def shutdown_db_client():
    try:
        app.mongodb_client.close()
        logger.info("MongoDB connection closed")
    except Exception as e:
        logger.error(f"Error closing MongoDB connection: {str(e)}")

# Error handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global error handler caught: {str(exc)}")
    logger.error(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error occurred"}
    )

# Import and include routers
try:
    from app.routes import users, organizations, applications, analytics
    
    app.include_router(users.router, prefix="/api/users", tags=["users"])
    app.include_router(organizations.router, prefix="/api/organizations", tags=["organizations"])
    app.include_router(applications.router, prefix="/api/applications", tags=["applications"])
    app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
    logger.info("Successfully imported and included routers")
except Exception as e:
    logger.error(f"Error importing routers: {str(e)}")
    logger.error(traceback.format_exc())
    raise

@app.get("/")
async def root():
    return {"message": "Welcome to DTL Logistics Platform API"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port) 