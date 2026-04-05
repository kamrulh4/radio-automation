from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List
import asyncio

from ..db.database import get_db
from ..db.models import DownloadSource as DBSource
from ..db.schemas import DownloadSourceCreate, DownloadSource
from .auth import get_admin_user, get_current_user
from ..db.models import User as DBUser
from ..services.download_service import DownloadService

router = APIRouter()
downloader = DownloadService()

@router.get("/", response_model=List[DownloadSource])
async def list_sources(db: AsyncSession = Depends(get_db), admin=Depends(get_admin_user)):
    result = await db.execute(select(DBSource))
    return result.scalars().all()

@router.get("/station/{station_id}", response_model=List[DownloadSource])
async def list_station_sources(station_id: int, db: AsyncSession = Depends(get_db), current_user: DBUser = Depends(get_current_user)):
    """Allows DJs to see sources for their assigned station"""
    # If DJ, only allow their own station
    if current_user.role == "dj" and current_user.assigned_station_id != station_id:
        raise HTTPException(status_code=403, detail="Not authorized for this station")
        
    result = await db.execute(
        select(DBSource).where(and_(DBSource.station_id == station_id, DBSource.is_active == True))
    )
    return result.scalars().all()

@router.post("/", response_model=DownloadSource)
async def create_source(source: DownloadSourceCreate, db: AsyncSession = Depends(get_db), admin=Depends(get_admin_user)):
    new_source = DBSource(
        name=source.name,
        url=source.url,
        username=source.username,
        password=source.password,
        output_filename=source.output_filename,
        station_id=source.station_id,
        is_active=source.is_active,
        schedule_minute=source.schedule_minute,
        schedule_hour=source.schedule_hour,
        schedule_day_of_week=source.schedule_day_of_week,
        is_ai_mode=source.is_ai_mode,
        prompt_text=source.prompt_text,
        ai_voice_id=source.ai_voice_id,
        max_retries=source.max_retries
    )
    db.add(new_source)
    await db.commit()
    await db.refresh(new_source)
    return new_source

@router.delete("/{source_id}")
async def delete_source(source_id: int, db: AsyncSession = Depends(get_db), admin=Depends(get_admin_user)):
    result = await db.execute(select(DBSource).where(DBSource.id == source_id))
    source = result.scalars().first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    await db.delete(source)
    await db.commit()
    return {"status": "success", "message": "Source deleted"}

@router.post("/{source_id}/trigger")
async def trigger_source(source_id: int, db: AsyncSession = Depends(get_db), current_user: DBUser = Depends(get_current_user)):
    result = await db.execute(select(DBSource).where(DBSource.id == source_id))
    source = result.scalars().first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
        
    # Security: If DJ, must match assigned station
    if current_user.role == "dj" and current_user.assigned_station_id != source.station_id:
        raise HTTPException(status_code=403, detail="Not authorized for this source")
    
    from ..db.models import Station as DBStation
    st_result = await db.execute(select(DBStation).where(DBStation.id == source.station_id))
    station = st_result.scalars().first()
    if not station:
        raise HTTPException(status_code=400, detail="Station not found")
    
    auth = None
    if source.username and source.password:
        auth = (source.username, source.password)
    
    # Use to_thread for manual trigger too
    success = await asyncio.to_thread(
        downloader.download_custom,
        source.url, 
        station.name, 
        source.output_filename, 
        auth=auth,
        max_retries=source.max_retries,
        is_ai_mode=source.is_ai_mode,
        prompt_text=source.prompt_text,
        ai_voice_id=source.ai_voice_id
    )
    
    if success:
        return {"status": "success", "message": f"Downloaded {source.output_filename}"}
    return {"status": "error", "message": f"Failed to download from {source.url}"}
