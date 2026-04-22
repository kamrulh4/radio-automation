import os
from typing import Dict, List, Optional
from google.cloud import texttospeech
from google.oauth2 import service_account

class GoogleTTSService:
    """Google Cloud TTS API service for voice synthesis and management"""
    
    def __init__(self):
        # The client will automatically look for GOOGLE_APPLICATION_CREDENTIALS
        # Environment variable, which should be set in .env
        from dotenv import load_dotenv
        load_dotenv()
        try:
            self.client = texttospeech.TextToSpeechClient()
        except Exception as e:
            print(f"Warning: Could not initialize Google TTS client. {e}")
            self.client = None
            
    def get_voices(self, language_code: Optional[str] = None) -> List[Dict]:
        """Fetch available voices (filtered by language_code if provided)"""
        if not self.client:
            raise Exception("TTS Client not initialized. Check GOOGLE_APPLICATION_CREDENTIALS.")
            
        try:
            voices_response = self.client.list_voices(language_code=language_code)
            
            voice_list = []
            # Sort voices for better display (Chirp, Neural2, then Wavenet)
            for voice in sorted(voices_response.voices, key=lambda v: v.name):
                # Filter out basic "Standard" voices to only display "Pro/Premium" quality ones
                if "Standard" in voice.name:
                    continue
                    
                # We can return standard dict format to keep compatibility with the frontend structure
                voice_list.append({
                    "voice_id": voice.name,
                    "name": voice.name,
                    "category": texttospeech.SsmlVoiceGender(voice.ssml_gender).name,
                    "labels": {"accent": ", ".join(voice.language_codes)}
                })
            
            return voice_list
        except Exception as e:
            raise Exception(f"Failed to fetch Google TTS voices: {str(e)}")
            
    def get_voice_by_name(self, voice_name: str) -> Optional[Dict]:
        """Find a voice by its exact name (which is also its voice_id)"""
        if not self.client:
            return None
            
        voices = self.get_voices()
        for voice in voices:
            if voice['name'] == voice_name:
                return voice
        return None
        
    def generate_speech(self, text: str, voice_name: str, 
                       speaking_rate: float = 1.0, pitch: float = 0.0, volume_gain_db: float = 0.0) -> bytes:
        """Generate speech using Google TTS returning MP3 file content"""
        if not self.client:
            raise Exception("TTS Client not initialized.")
            
        try:
            synthesis_input = texttospeech.SynthesisInput(text=text)
            
            # Use specific language code based on the voice name 
            # e.g., "it-IT-Neural2-A" -> "it-IT"
            language_code = "-".join(voice_name.split("-")[:2]) if "-" in voice_name else "it-IT"
            
            voice_params = texttospeech.VoiceSelectionParams(
                language_code=language_code,
                name=voice_name
            )
            
            audio_config = texttospeech.AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.MP3,
                speaking_rate=speaking_rate,
                pitch=pitch,
                volume_gain_db=volume_gain_db,
                sample_rate_hertz=48000 # Client requested 48 kHz Mono
            )
            
            response = self.client.synthesize_speech(
                input=synthesis_input, 
                voice=voice_params, 
                audio_config=audio_config
            )
            
            return response.audio_content
            
        except Exception as e:
            raise Exception(f"Google TTS generation failed: {str(e)}")
