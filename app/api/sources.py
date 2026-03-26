from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import asyncio

from ..db.database import get_db
from ..db.models import DownloadSource as DBSource
from ..db.schemas import DownloadSourceCreate, DownloadSource
from .auth import get_admin_user
from ..services.download_service import DownloadService

router = APIRouter()
downloader = DownloadService()

@router.get("/", response_model=List[DownloadSource])
async def list_sources(db: AsyncSession = Depends(get_db), admin=Depends(get_admin_user)):
    result = await db.execute(select(DBSource))
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
async def trigger_source(source_id: int, db: AsyncSession = Depends(get_db), admin=Depends(get_admin_user)):
    result = await db.execute(select(DBSource).where(DBSource.id == source_id))
    source = result.scalars().first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    
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
        max_retries=source.max_retries
    )
    
    if success:
        return {"status": "success", "message": f"Downloaded {source.output_filename}"}
    return {"status": "error", "message": f"Failed to download from {source.url}"}
