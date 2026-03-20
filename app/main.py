from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from apscheduler.schedulers.background import BackgroundScheduler
from .core.config import settings
from .services.download_service import DownloadService
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

def scheduled_downloads():
    """Runs automated downloads for all stations"""
    print(f"Running scheduled downloads at {os.getpid()}")
    for station in settings.STATIONS:
        downloader.download_meteo(station)
        downloader.download_news(station)
        downloader.download_traffic_lombardia(station)

# Scheduler
scheduler = BackgroundScheduler()
scheduler.add_job(scheduled_downloads, 'interval', minutes=60) # Run every hour
scheduler.start()

@app.on_event("startup")
async def startup_event():
    # Run initial download on start
    scheduled_downloads()

@app.get("/")
async def root():
    return {"message": "Radio Automation API is running", "stations": settings.STATIONS}

# Import and include routers
from .api import auth, tts, downloads
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(tts.router, prefix="/api/tts", tags=["TTS"])
app.include_router(downloads.router, prefix="/api/downloads", tags=["Downloads"])
