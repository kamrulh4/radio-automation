from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from .core.config import settings
from .services.download_service import DownloadService
from .db.database import AsyncSessionLocal
from .db.models import Station as DBStation
from sqlalchemy import select
import os

app = FastAPI(title="Radio Automation Platform", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve public files (RadioDJ)
app.mount("/public", StaticFiles(directory=os.path.join(settings.STORAGE_PATH, "public")), name="public")

# Initialize downloader service
downloader = DownloadService()

async def scheduled_downloads():
    """Runs automated downloads for all active stations dynamically from the DB"""
    print(f"Running scheduled downloads at {os.getpid()}")
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(DBStation).where(DBStation.is_active == True))
        active_stations = result.scalars().all()
        
        for station in active_stations:
            downloader.download_meteo(station.name)
            downloader.download_news(station.name)
            downloader.download_traffic_lombardia(station.name)

# Scheduler
scheduler = AsyncIOScheduler()
scheduler.add_job(scheduled_downloads, 'interval', minutes=60) # Run every hour
scheduler.start()

@app.on_event("startup")
async def startup_event():
    # Run initial download on start
    await scheduled_downloads()

@app.get("/")
async def root():
    return {"message": "Radio Automation API is running"}

# Import and include routers
from .api import auth, tts, downloads, users, stations
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(tts.router, prefix="/api/tts", tags=["TTS"])
app.include_router(downloads.router, prefix="/api/downloads", tags=["Downloads"])
app.include_router(users.router, prefix="/api/users", tags=["User Management"])
app.include_router(stations.router, prefix="/api/stations", tags=["Station Management"])
