from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..db.models import SystemSetting as DBSetting
from ..core.config import settings
from typing import Optional

class SettingsService:
    """Service to manage system settings with database persistence and .env fallback"""
    
    @staticmethod
    async def get_setting(db: AsyncSession, key: str) -> Optional[str]:
        """Fetch a setting from the database, fallback to .env config if not found"""
        result = await db.execute(select(DBSetting).where(DBSetting.key == key))
        db_setting = result.scalars().first()
        
        if db_setting and db_setting.value:
            return db_setting.value
            
        # Fallback to settings object (which reads from .env)
        return getattr(settings, key, None)

    @staticmethod
    async def set_setting(db: AsyncSession, key: str, value: str):
        """Update or create a system setting in the database"""
        result = await db.execute(select(DBSetting).where(DBSetting.key == key))
        db_setting = result.scalars().first()
        
        if db_setting:
            db_setting.value = value
        else:
            db_setting = DBSetting(key=key, value=value)
            db.add(db_setting)
            
        await db.commit()
        return db_setting

    @staticmethod
    async def get_all_settings(db: AsyncSession):
        """Fetch all settings from the database"""
        result = await db.execute(select(DBSetting))
        return result.scalars().all()
