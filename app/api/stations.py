from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from ..db.database import get_db
from ..db.models import Station as DBStation
from ..db.schemas import StationCreate, Station
from .auth import get_admin_user, get_current_user
from ..core.config import settings
import os

router = APIRouter()

@router.get("/", response_model=List[Station])
async def read_stations(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBStation))
    return result.scalars().all()

@router.post("/", response_model=Station)
async def create_station(
    station: StationCreate, 
    db: AsyncSession = Depends(get_db),
    admin_user = Depends(get_admin_user)
):
    # Check if station exists
    result = await db.execute(select(DBStation).where(DBStation.name == station.name))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Station already exists")
    
    new_station = DBStation(name=station.name, display_name=station.display_name, is_active=station.is_active)
    db.add(new_station)
    await db.commit()
    await db.refresh(new_station)
    
    # Create storage directories for new station
    os.makedirs(os.path.join(settings.STORAGE_PATH, "stations", new_station.name), exist_ok=True)
    os.makedirs(os.path.join(settings.STORAGE_PATH, "public", new_station.name), exist_ok=True)
    
    return new_station
