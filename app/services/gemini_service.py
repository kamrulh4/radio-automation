from google import genai
from typing import Optional
from ..core.config import settings

class GeminiService:
    """Service for Google Gemini content generation using modern google-genai SDK"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.client = None
        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)
            
    def generate_text(self, prompt: str, model_name: str = 'gemini-1.5-flash') -> str:
        """Generate text using Gemini model"""
        if not self.api_key or not self.client:
            raise Exception("Gemini API key not configured")
            
        try:
            # Use the new SDK's generation method
            response = self.client.models.generate_content(
                model=model_name,
                contents=prompt
            )
            
            if not response or not response.text:
                raise Exception("Gemini returned empty or invalid response")
                
            return response.text
        except Exception as e:
            raise Exception(f"Gemini generation failed: {str(e)}")
