from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from pydantic import BaseModel
from typing import Optional, Dict, List
from .auth import get_current_user
from ..services.google_tts_service import GoogleTTSService
from ..services.gemini_service import GeminiService
from ..services.file_service import FileService
from ..services.settings_service import SettingsService
from ..db.models import User as DBUser, Station as DBStation
from ..db.database import get_db
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import os

router = APIRouter()
google_tts = GoogleTTSService()
file_service = FileService()

class TTSRequest(BaseModel):
    text: str
    voice_name: str
    station: str
    filename: Optional[str] = None
    speaking_rate: float = 1.0
    pitch: float = 0.0
    volume_gain_db: float = 0.0

class AIPromptRequest(BaseModel):
    prompt: str

@router.get("/voices")
async def get_voices(current_user: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return google_tts.get_voices(language_code="it-IT")

@router.post("/generate")
async def generate_speech(request: TTSRequest, current_user: DBUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBStation).where(DBStation.name == request.station))
    if not result.scalars().first():
        raise HTTPException(status_code=400, detail="Invalid station")
        
    voice = google_tts.get_voice_by_name(request.voice_name)
    if not voice:
        raise HTTPException(status_code=404, detail=f"Voice {request.voice_name} not found")
        
    try:
        audio_content = google_tts.generate_speech(
            text=request.text,
            voice_name=request.voice_name,
            speaking_rate=request.speaking_rate,
            pitch=request.pitch,
            volume_gain_db=request.volume_gain_db
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
@router.post("/generate-ai-text")
async def generate_ai_text(request: AIPromptRequest, current_user: DBUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Generates text based on a prompt using Gemini (DJs & Admins)"""
    try:
        db_key = await SettingsService.get_setting(db, "GEMINI_API_KEY")
        if not db_key:
             raise HTTPException(status_code=400, detail="Gemini API Key missing in settings")
             
        gemini = GeminiService(api_key=db_key)
        generated_text = gemini.generate_text(request.prompt)
        return {"status": "success", "text": generated_text}
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"AI Generation Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI Error: {str(e)}")
