from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from .core.config import settings
from .services.download_service import DownloadService
from .db.database import AsyncSessionLocal
from .db.models import Station as DBStation, DownloadSource as DBSource
from sqlalchemy import select
from datetime import datetime
import os
import asyncio

app = FastAPI(title="Radio Automation Platform", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve public files (RadioDJ)
app.mount("/public", StaticFiles(directory=os.path.join(settings.STORAGE_PATH, "public")), name="public")

# Initialize downloader service
downloader = DownloadService()

def is_time_to_run(current_val: int, pattern: str) -> bool:
    """Helper to check if current minute/hour/day matches the pattern"""
    if not pattern or pattern == "*":
        return True
    
    # Normalize pattern: lower case
    pattern = pattern.lower().strip()
    
    # Day mapping helper
    day_map = {"mon": 0, "tue": 1, "wed": 2, "thu": 3, "fri": 4, "sat": 5, "sun": 6}
    
    try:
        # Handle "*/5" (every 5 minutes/hours)
        if pattern.startswith("*/"):
            step = int(pattern.split("/")[1])
            return current_val % step == 0
            
        # Handle range "0-5" or "mon-fri"
        if "-" in pattern:
            start_str, end_str = pattern.split("-")
            start = day_map.get(start_str.strip(), -1)
            if start == -1: start = int(start_str.strip())
            
            end = day_map.get(end_str.strip(), -1)
            if end == -1: end = int(end_str.strip())
            
            return start <= current_val <= end
            
        # Handle comma separated values: "0,30" or "mon,wed,fri"
        allowed_parts = [p.strip() for p in pattern.split(",")]
        allowed_vals = []
        for p in allowed_parts:
            if p in day_map:
                allowed_vals.append(day_map[p])
            elif p.isdigit():
                allowed_vals.append(int(p))
                
        return current_val in allowed_vals
    except:
        return False

async def scheduled_downloads():
    """Runs automated downloads. Check every minute for custom sources."""
    now = datetime.now()
    print(f"Checking scheduled downloads at {now.strftime('%Y-%m-%d %H:%M')}")
    
    async with AsyncSessionLocal() as session:
        # 1. Fetch active stations for legacy downloads (still hourly at :00)
        if now.minute == 0:
            result = await session.execute(select(DBStation).where(DBStation.is_active == True))
            active_stations = result.scalars().all()
            for station in active_stations:
                # Run sync downloads in threads to avoid blocking
                await asyncio.to_thread(downloader.download_meteo, station.name)
                await asyncio.to_thread(downloader.download_news, station.name)
                await asyncio.to_thread(downloader.download_traffic_lombardia, station.name)
        
        # 2. Fetch all active custom download sources
        src_result = await session.execute(
            select(DBSource).where(DBSource.is_active == True)
        )
        custom_sources = src_result.scalars().all()
        
        current_minute = now.minute
        current_hour = now.hour
        current_day = now.weekday() 

        # 3. Fetch API Keys for AI content
        from .services.settings_service import SettingsService
        gemini_key = await SettingsService.get_setting(session, "GEMINI_API_KEY")

        for source in custom_sources:
            if (is_time_to_run(current_minute, source.schedule_minute) and 
                is_time_to_run(current_hour, source.schedule_hour) and 
                is_time_to_run(current_day, source.schedule_day_of_week)):
                
                # Fetch station name for path mapping
                st_result = await session.execute(select(DBStation).where(DBStation.id == source.station_id))
                station = st_result.scalars().first()
                if station:
                    auth = (source.username, source.password) if source.username and source.password else None
                    # Run sync download in a thread
                    await asyncio.to_thread(
                        downloader.download_custom,
                        source.url, 
                        station.name, 
                        source.output_filename, 
                        auth=auth,
                        max_retries=source.max_retries,
                        is_ai_mode=source.is_ai_mode,
                        prompt_text=source.prompt_text,
                        ai_voice_id=source.ai_voice_id,
                        gemini_key=gemini_key
                    )

# Scheduler
scheduler = AsyncIOScheduler()
scheduler.add_job(scheduled_downloads, 'cron', minute='*')
scheduler.start()

async def seed_db():
    """Create default stations and users if they don't exist"""
    from .api.auth import get_password_hash
    from .db.models import Station, User
    
    async with AsyncSessionLocal() as session:
        # 1. Create stations
        default_stations = [
            {"name": "Radio_Garda", "display_name": "Radio Garda"},
            {"name": "Radio_105", "display_name": "Radio 105"}
        ]
        
        for st_data in default_stations:
            stmt = select(Station).where(Station.name == st_data["name"])
            result = await session.execute(stmt)
            if not result.scalars().first():
                print(f"Seeding station: {st_data['name']}")
                new_station = Station(name=st_data["name"], display_name=st_data["display_name"])
                session.add(new_station)
        
        await session.commit()

        # 2. Create admin user
        stmt = select(User).where(User.username == "admin")
        result = await session.execute(stmt)
        if not result.scalars().first():
            print("Seeding default admin user")
            admin_user = User(
                username="admin",
                hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
                role="admin"
            )
            session.add(admin_user)

        # 3. Create DJ users
        users_to_seed = [
            {"username": "dj_garda", "station_name": "Radio_Garda"},
            {"username": "dj_105", "station_name": "Radio_105"}
        ]
        
        for user_data in users_to_seed:
            stmt = select(User).where(User.username == user_data["username"])
            result = await session.execute(stmt)
            if not result.scalars().first():
                print(f"Seeding DJ user: {user_data['username']}")
                st_stmt = select(Station).where(Station.name == user_data["station_name"])
                st_result = await session.execute(st_stmt)
                station = st_result.scalars().first()
                
                dj_user = User(
                    username=user_data["username"],
                    hashed_password=get_password_hash("dj123"), # Default password for testing
                    role="dj",
                    assigned_station_id=station.id if station else None
                )
                session.add(dj_user)
            
        await session.commit()

@app.on_event("startup")
async def startup_event():
    from .db.database import engine
    from .db.models import Base
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Seed default data
    await seed_db()
    
    # Run initial check
    await scheduled_downloads()

@app.get("/")
async def root():
    return {"message": "Radio Automation API is running"}

# Import and include routers
from .api import auth, tts, downloads, users, stations, sources, admin_settings
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(tts.router, prefix="/api/tts", tags=["TTS"])
app.include_router(downloads.router, prefix="/api/downloads", tags=["Downloads"])
app.include_router(users.router, prefix="/api/users", tags=["User Management"])
app.include_router(stations.router, prefix="/api/stations", tags=["Station Management"])
app.include_router(sources.router, prefix="/api/sources", tags=["Download Sources"])
app.include_router(admin_settings.router, prefix="/api/settings", tags=["System Settings"])
