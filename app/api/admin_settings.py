from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict
from ..db.database import get_db
from ..services.settings_service import SettingsService
from .auth import get_admin_user
from pydantic import BaseModel

router = APIRouter()

class SettingUpdate(BaseModel):
    key: str
    value: str

@router.get("/")
async def list_settings(db: AsyncSession = Depends(get_db), admin=Depends(get_admin_user)):
    """List all system settings (Admin only)"""
    db_settings = await SettingsService.get_all_settings(db)
    
    # Return a merged list of DB settings and default config for visibility
    return db_settings

@router.post("/")
async def update_setting(update: SettingUpdate, db: AsyncSession = Depends(get_db), admin=Depends(get_admin_user)):
    """Update a specific setting (Admin only)"""
    try:
        updated = await SettingsService.set_setting(db, update.key, update.value)
        return {"status": "success", "key": updated.key, "value": updated.value}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
