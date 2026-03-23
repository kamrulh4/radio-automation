from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from pydantic import BaseModel
from typing import Optional, Dict, List
from .auth import get_current_user
from ..services.elevenlabs_service import ElevenLabsService
from ..services.file_service import FileService
from ..db.models import User as DBUser, Station as DBStation
from ..db.database import get_db
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import os

router = APIRouter()
elevenlabs = ElevenLabsService()
file_service = FileService()

class TTSRequest(BaseModel):
    text: str
    voice_name: str
    station: str
    filename: Optional[str] = None
    stability: float = 0.5
    similarity: float = 0.5

@router.get("/voices")
async def get_voices(current_user: str = Depends(get_current_user)):
    return elevenlabs.get_voices()

@router.get("/usage")
async def get_usage(current_user: str = Depends(get_current_user)):
    return elevenlabs.get_user_subscription()

@router.post("/generate")
async def generate_speech(request: TTSRequest, current_user: DBUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBStation).where(DBStation.name == request.station))
    if not result.scalars().first():
        raise HTTPException(status_code=400, detail="Invalid station")
        
    voice = elevenlabs.get_voice_by_name(request.voice_name)
    if not voice:
        raise HTTPException(status_code=404, detail=f"Voice {request.voice_name} not found")
        
    try:
        audio_content = elevenlabs.generate_speech(
            text=request.text,
            voice_id=voice['voice_id'],
            stability=request.stability,
            similarity=request.similarity
        )
        
        # Generate unique filename if not provided
        if not request.filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            final_filename = f"tts_{timestamp}"
        else:
            final_filename = request.filename
            
        # Save to public folder for RadioDJ
        filepath = file_service.save_audio(
            audio_data=audio_content,
            station=request.station,
            filename=final_filename,
            is_public=True
        )
        
        return {
            "status": "success",
            "filename": os.path.basename(filepath),
            "url": f"/public/{request.station}/{os.path.basename(filepath)}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
