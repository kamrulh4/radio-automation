from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from .auth import get_current_user
from ..db.models import User as DBUser, Station as DBStation
from ..db.database import get_db
from ..services.download_service import DownloadService
from ..services.file_service import FileService
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import os

router = APIRouter()
downloader = DownloadService()
file_service = FileService()

@router.post("/trigger/{type}")
async def trigger_download(type: str, station: str = "Radio_Garda", current_user: DBUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Validate station exists in DB
    result = await db.execute(select(DBStation).where(DBStation.name == station))
    if not result.scalars().first():
        raise HTTPException(status_code=400, detail="Invalid station")
        
    success = False
    import asyncio
    if type == "meteo":
        success = await asyncio.to_thread(downloader.download_meteo, station)
    elif type == "news":
        success = await asyncio.to_thread(downloader.download_news, station)
    elif type == "traffic":
        success = await asyncio.to_thread(downloader.download_traffic_lombardia, station)
    else:
        raise HTTPException(status_code=400, detail="Invalid download type")
        
    if not success:
         return {
             "status": "error", 
             "message": f"Source file for {type} is currently unavailable for station {station}. It might not be uploaded yet by the provider."
         }
        
    return {"status": "success", "message": f"{type} download completed successfully"}

@router.get("/list/{station}")
async def list_files(station: str, current_user: DBUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBStation).where(DBStation.name == station))
    if not result.scalars().first():
        raise HTTPException(status_code=400, detail="Invalid station")
    return file_service.get_station_files(station)

@router.post("/upload/{station}")
async def upload_file(station: str, file: UploadFile = File(...), current_user: DBUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBStation).where(DBStation.name == station))
    if not result.scalars().first():
        raise HTTPException(status_code=400, detail="Invalid station")
        
    content = await file.read()
    filepath = file_service.save_audio(content, station, file.filename, is_public=True)
    
    return {
        "status": "success",
        "filename": os.path.basename(filepath),
        "url": f"/public/{station}/{os.path.basename(filepath)}"
    }
