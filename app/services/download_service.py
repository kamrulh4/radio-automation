import requests
import os
from datetime import datetime
from typing import Optional
from .file_service import FileService
from ..core.config import settings

# Disable SSL warnings for sites with self-signed certs
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class DownloadService:
    """Handles logic for automated batch downloads from external providers"""
    
    def __init__(self):
        self.file_service = FileService()
        self.session = requests.Session()
        self.session.verify = False
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "audio/mpeg,audio/*;q=0.9,*/*;q=0.8",
            "Accept-Encoding": "identity",
            "Connection": "keep-alive",
            "Referer": "https://allnews.fm/"
        })
        
    def download_meteo(self, station: str = "Radio_Garda"):
        """Downloads METEO from 3B Meteo"""
        date_str = datetime.now().strftime("%Y-%m-%d")
        url = f"https://radio.3bmeteo.com/radiogarda/{date_str}.mp3"
        
        try:
            response = self.session.get(url, timeout=60)
            if response.status_code == 200 and len(response.content) > 1000:
                self.file_service.save_audio(response.content, station, "meteoggi.mp3", is_public=True)
                print(f"Meteo downloaded successfully ({len(response.content)} bytes)")
                return True
            print(f"Meteo download failed: HTTP {response.status_code}")
            return False
        except Exception as e:
            print(f"Meteo download failed: {str(e)}")
            return False
            
    def download_news(self, station: str = "Radio_Garda"):
        """Downloads NEWS from AllNews.fm using Basic Auth (same as PS1 script)"""
        # CRITICAL: allnews.fm uses Italian server time (Europe/Rome = CET/CEST)
        # We must request files using Italian time, not local server time!
        try:
            from zoneinfo import ZoneInfo
        except ImportError:
            from backports.zoneinfo import ZoneInfo
        
        from datetime import timezone
        now = datetime.now(ZoneInfo("Europe/Rome"))
        date_str = now.strftime("%y_%m_%d")
        
        hour = now.hour
        minute = now.minute
        
        if minute < 45:
            last_hour = hour - 1
        else:
            last_hour = hour
        
        # Wrap around midnight
        if last_hour < 0:
            last_hour = 23
            
        time_slot = f"{last_hour:02d}40"
        filename = f"{date_str}_BIANCA2_edizione{time_slot}.mp3"
        url = f"https://allnews.fm/radioweb/gr-lite/{filename}"
        
        # Same credentials as in the PS1 script
        auth = ("vivalaradio2", "Viva1")
        
        success = self._try_download_news(station, url, auth)
        
        if not success:
            # Fallback to previous slot
            prev_hour = last_hour - 1
            if prev_hour < 0:
                prev_hour = 23
            time_slot = f"{prev_hour:02d}40"
            filename = f"{date_str}_BIANCA2_edizione{time_slot}.mp3"
            url = f"https://allnews.fm/radioweb/gr-lite/{filename}"
            print(f"Current news missing, falling back to: {url}")
            success = self._try_download_news(station, url, auth)
            
        return success

    def _try_download_news(self, station: str, url: str, auth: tuple):
        try:
            print(f"Attempting news download: {url}")
            response = self.session.get(url, auth=auth, timeout=60)
            print(f"News response status: {response.status_code}, size: {len(response.content)} bytes")
            if response.status_code == 200 and len(response.content) > 1000:
                self.file_service.save_audio(response.content, station, "AREA24.mp3", is_public=True)
                print(f"News downloaded successfully!")
                return True
            return False
        except Exception as e:
            print(f"News download error: {str(e)}")
            return False

    def download_traffic_lombardia(self, station: str = "Radio_Garda"):
        """Downloads Traffic for Lombardia"""
        url = "https://publisher.luceverde.it/not/newsPublished/Luceverde%20Milano%20audio/audio/D/MWoPCIExMl3JkmrUIDXvhkoacPor21LdlRcTxMl3JkoUJIZnABOFnxrgVsgMl32MWoPCIExMl3JkmrUIDXvhkoacPor21LdlRcTxMl3JkoUJIZnABOFnxrgVsgMl32"
        
        try:
            response = self.session.get(url, timeout=60)
            if response.status_code == 200 and len(response.content) > 1000:
                self.file_service.save_audio(response.content, station, "lombtraf.mp3", is_public=True)
                print(f"Traffic downloaded successfully ({len(response.content)} bytes)")
                return True
            print(f"Traffic download failed: HTTP {response.status_code}")
            return False
        except Exception as e:
            print(f"Traffic download failed: {str(e)}")
            return False

    def download_custom(self, url: str, station: str, output_filename: str, auth: tuple = None):
        """Downloads from any custom URL configured by admin"""
        try:
            print(f"Custom download: {url} -> {output_filename}")
            kwargs = {"timeout": 60}
            if auth:
                kwargs["auth"] = auth
            response = self.session.get(url, **kwargs)
            if response.status_code == 200 and len(response.content) > 100:
                self.file_service.save_audio(response.content, station, output_filename, is_public=True)
                print(f"Custom download OK: {output_filename} ({len(response.content)} bytes)")
                return True
            print(f"Custom download failed: HTTP {response.status_code}")
            return False
        except Exception as e:
            print(f"Custom download error: {str(e)}")
            return False
