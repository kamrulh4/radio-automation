import httpx
import os
import subprocess
from datetime import datetime
from typing import Optional
from .file_service import FileService
from ..core.config import settings

class DownloadService:
    """Handles logic for automated batch downloads from external providers"""
    
    def __init__(self):
        self.file_service = FileService()
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Accept": "audio/mpeg,audio/*;q=0.9,*/*;q=0.8",
            "Referer": "https://allnews.fm/"
        }
        self.client = httpx.Client(verify=False, timeout=60.0, headers=self.headers)
        
    def download_meteo(self, station: str = "Radio_Garda"):
        """Downloads METEO from 3B Meteo"""
        date_str = datetime.now().strftime("%Y-%m-%d")
        # Example URL from batch file: https://radio.3bmeteo.com/radiogarda/2026-03-23.mp3
        # Use 'radiogarda' as the path segment for all stations since they share the feed for now,
        # or customize per station if they have different feeds.
        url = f"https://radio.3bmeteo.com/radiogarda/{date_str}.mp3"
        
        try:
            response = self.client.get(url)
            if response.status_code == 200:
                self.file_service.save_audio(response.content, station, "meteoggi.mp3", is_public=True)
                return True
            return False
        except Exception as e:
            print(f"Meteo download failed: {str(e)}")
            return False
            
    def download_news(self, station: str = "Radio_Garda"):
        """Downloads NEWS from AllNews.fm"""
        # Logic from Automate-File-Downloads.ps1
        now = datetime.now()
        date_str = now.strftime("%y_%m_%d")
        
        # Last 40-minute slot logic
        hour = now.hour
        minute = now.minute
        
        if minute < 45:
            last_hour = hour - 1
        else:
            last_hour = hour
            
        time_slot = f"{last_hour:02d}40"
        filename = f"{date_str}_BIANCA2_edizione{time_slot}.mp3"
        url = f"https://allnews.fm/radioweb/gr-lite/{filename}"
        
        # Basic Auth: vivalaradio2 / Viva1
        auth = ("vivalaradio2", "Viva1")
        
        # Attempt download with fallback
        success = self._try_download_news(station, url, auth)
        
        if not success:
            # Fallback to previous slot
            prev_hour = last_hour - 1
            if prev_hour < 0: prev_hour = 23
            time_slot = f"{prev_hour:02d}40"
            filename = f"{date_str}_BIANCA2_edizione{time_slot}.mp3"
            url = f"https://allnews.fm/radioweb/gr-lite/{filename}"
            print(f"Current news missing, falling back to: {url}")
            success = self._try_download_news(station, url, auth)
            
        return success

    def _try_download_news(self, station: str, url: str, auth: tuple):
        try:
            print(f"Attempting news download: {url}")
            response = self.client.get(url, auth=auth)
            print(f"News response status: {response.status_code}")
            if response.status_code == 200:
                self.file_service.save_audio(response.content, station, "AREA24.mp3", is_public=True)
                return True
            return False
        except Exception as e:
            print(f"News download connection error: {str(e)}")
            return False

    def download_traffic_lombardia(self, station: str = "Radio_Garda"):
        """Downloads Traffic for Lombardia"""
        url = "https://publisher.luceverde.it/not/newsPublished/Luceverde%20Milano%20audio/audio/D/MWoPCIExMl3JkmrUIDXvhkoacPor21LdlRcTxMl3JkoUJIZnABOFnxrgVsgMl32MWoPCIExMl3JkmrUIDXvhkoacPor21LdlRcTxMl3JkoUJIZnABOFnxrgVsgMl32"
        
        try:
            response = self.client.get(url)
            if response.status_code == 200:
                self.file_service.save_audio(response.content, station, "lombtraf.mp3", is_public=True)
                return True
            return False
        except Exception as e:
            print(f"Traffic download failed: {str(e)}")
            return False
