import google.generativeai as genai
from typing import Optional
from ..core.config import settings

class GeminiService:
    """Service for Google Gemini content generation"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        if self.api_key:
            genai.configure(api_key=self.api_key)
            
    def generate_text(self, prompt: str, model_name: str = 'gemini-pro') -> str:
        """Generate text using Gemini model"""
        if not self.api_key:
            raise Exception("Gemini API key not configured")
            
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(prompt)
            
            if not response or not response.text:
                raise Exception("Gemini returned empty or invalid response")
                
            return response.text
        except Exception as e:
            raise Exception(f"Gemini generation failed: {str(e)}")
