import requests
import json
from typing import Dict, List, Optional
import os
from ..core.config import settings

class ElevenLabsService:
    """ElevenLabs API service for voice synthesis and management"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.ELEVENLABS_API_KEY
        self.base_url = "https://api.elevenlabs.io/v1"
        self.headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": self.api_key
        }
        
    def get_voices(self) -> List[Dict]:
        """Fetch all available voices"""
        url = f"{self.base_url}/voices"
        headers = {"xi-api-key": self.api_key}
        
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            return response.json().get('voices', [])
        except Exception as e:
            raise Exception(f"Failed to fetch voices: {str(e)}")
            
    def get_voice_by_name(self, voice_name: str) -> Optional[Dict]:
        """Find a voice by its name"""
        voices = self.get_voices()
        for voice in voices:
            if voice['name'].lower() == voice_name.lower():
                return voice
        return None
        
    def generate_speech(self, text: str, voice_id: str, 
                       stability: float = 0.5, similarity: float = 0.5) -> bytes:
        """Generate speech using ElevenLabs TTS"""
        url = f"{self.base_url}/text-to-speech/{voice_id}"
        
        data = {
            "text": text,
            "model_id": "eleven_multilingual_v2",
            "voice_settings": {
                "stability": stability,
                "similarity_boost": similarity,
                "use_speaker_boost": True
            }
        }
        
        try:
            response = requests.post(url, json=data, headers=self.headers)
            
            if response.status_code != 200:
                error_msg = response.text
                try:
                    error_data = response.json()
                    error_msg = error_data.get('detail', {}).get('message', str(error_data))
                except:
                    pass
                raise Exception(f"ElevenLabs TTS failed: {error_msg}")
                
            return response.content
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"Network error during TTS generation: {str(e)}")
            
    def get_user_subscription(self) -> Dict:
        """Get character usage and subscription details"""
        url = f"{self.base_url}/user/subscription"
        headers = {"xi-api-key": self.api_key}
        
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            raise Exception(f"Failed to fetch subscription info: {str(e)}")
