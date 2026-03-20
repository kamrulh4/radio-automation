from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from .auth import get_current_user
from ..services.download_service import DownloadService
from ..services.file_service import FileService
from ..core.config import settings
import os

router = APIRouter()
downloader = DownloadService()
file_service = FileService()

@router.post("/trigger/{type}")
async def trigger_download(type: str, station: str = "Radio_Garda", current_user: str = Depends(get_current_user)):
    if station not in settings.STATIONS:
        raise HTTPException(status_code=400, detail="Invalid station")
        
    success = False
    if type == "meteo":
        success = downloader.download_meteo(station)
    elif type == "news":
        success = downloader.download_news(station)
    elif type == "traffic":
        success = downloader.download_traffic_lombardia(station)
    else:
        raise HTTPException(status_code=400, detail="Invalid download type")
        
    if not success:
        raise HTTPException(status_code=500, detail="Download failed")
        
    return {"status": "success", "message": f"{type} download triggered and completed"}

@router.get("/list/{station}")
async def list_files(station: str, current_user: str = Depends(get_current_user)):
    if station not in settings.STATIONS:
        raise HTTPException(status_code=400, detail="Invalid station")
    return file_service.get_station_files(station)

@router.post("/upload/{station}")
async def upload_file(station: str, file: UploadFile = File(...), current_user: str = Depends(get_current_user)):
    if station not in settings.STATIONS:
        raise HTTPException(status_code=400, detail="Invalid station")
        
    content = await file.read()
    filepath = file_service.save_audio(content, station, file.filename, is_public=True)
    
    return {
        "status": "success",
        "filename": os.path.basename(filepath),
        "url": f"/public/{station}/{os.path.basename(filepath)}"
    }
