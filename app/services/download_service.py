import requests
import os
from datetime import datetime
from typing import Optional, Any
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
        """Downloads METEO from 3B Meteo with retries"""
        import time
        date_str = datetime.now().strftime("%Y-%m-%d")
        url = f"https://radio.3bmeteo.com/radiogarda/{date_str}.mp3"
        
        max_retries = 3
        attempts = 0
        while attempts < max_retries:
            attempts += 1
            try:
                print(f"Attempting meteo download (Attempt {attempts}/{max_retries}): {url}")
                response = self.session.get(url, timeout=60)
                if response.status_code == 200 and len(response.content) > 1000:
                    self.file_service.save_audio(response.content, station, "meteoggi.mp3", is_public=True)
                    print(f"Meteo downloaded successfully!")
                    return True
                print(f"Meteo attempt {attempts} failed: HTTP {response.status_code}")
            except Exception as e:
                print(f"Meteo attempt {attempts} error: {str(e)}")
            
            if attempts < max_retries:
                time.sleep(5)
        return False
            
    def download_news(self, station: str = "Radio_Garda"):
        """Downloads NEWS from AllNews.fm using Basic Auth with fallback and retries"""
        try:
            from zoneinfo import ZoneInfo
        except ImportError:
            from backports.zoneinfo import ZoneInfo
        
        now = datetime.now(ZoneInfo("Europe/Rome"))
        date_str = now.strftime("%y_%m_%d")
        
        hour = now.hour
        # News logic: if before :45, get previous hour's news
        last_hour = hour - 1 if now.minute < 45 else hour
        if last_hour < 0: last_hour = 23
            
        time_slot = f"{last_hour:02d}40"
        filename = f"{date_str}_BIANCA2_edizione{time_slot}.mp3"
        url = f"https://allnews.fm/radioweb/gr-lite/{filename}"
        auth = ("vivalaradio2", "Viva1")
        
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
        import time
        max_retries = 3
        attempts = 0
        while attempts < max_retries:
            attempts += 1
            try:
                print(f"Attempting news download (Attempt {attempts}/{max_retries}): {url}")
                response = self.session.get(url, auth=auth, timeout=60)
                if response.status_code == 200 and len(response.content) > 1000:
                    self.file_service.save_audio(response.content, station, "AREA24.mp3", is_public=True)
                    print(f"News downloaded successfully!")
                    return True
                print(f"News attempt {attempts} failed: HTTP {response.status_code}")
            except Exception as e:
                print(f"News attempt {attempts} error: {str(e)}")
            
            if attempts < max_retries:
                time.sleep(5)
        return False

    def download_traffic_lombardia(self, station: str = "Radio_Garda"):
        """Downloads Traffic for Lombardia with retries"""
        import time
        url = "https://publisher.luceverde.it/not/newsPublished/Luceverde%20Milano%20audio/audio/D/MWoPCIExMl3JkmrUIDXvhkoacPor21LdlRcTxMl3JkoUJIZnABOFnxrgVsgMl32MWoPCIExMl3JkmrUIDXvhkoacPor21LdlRcTxMl3JkoUJIZnABOFnxrgVsgMl32"
        
        max_retries = 3
        attempts = 0
        while attempts < max_retries:
            attempts += 1
            try:
                print(f"Attempting traffic download (Attempt {attempts}/{max_retries}): {url}")
                response = self.session.get(url, timeout=60)
                if response.status_code == 200 and len(response.content) > 1000:
                    self.file_service.save_audio(response.content, station, "lombtraf.mp3", is_public=True)
                    print(f"Traffic downloaded successfully!")
                    return True
                print(f"Traffic attempt {attempts} failed: HTTP {response.status_code}")
            except Exception as e:
                print(f"Traffic attempt {attempts} error: {str(e)}")
            
            if attempts < max_retries:
                time.sleep(5)
        return False

    def download_custom(self, url: str, station: str, output_filename: str, auth: Optional[tuple] = None, max_retries: int = 3):
        """Downloads from any custom URL configured by admin with support for date placeholders and retries"""
        import time
        
        # 1. Replace placeholders (Client requirement #3: Support dynamic patterns)
        now = datetime.now()
        url = url.replace("{YYYY}", now.strftime("%Y"))
        url = url.replace("{MM}", now.strftime("%m"))
        url = url.replace("{DD}", now.strftime("%d"))
        url = url.replace("{date}", now.strftime("%Y-%m-%d"))
        
        # 2. Implement retries (Client requirement #5: retry 2-3 times)
        attempts = 0
        while attempts < max_retries:
            attempts += 1
            try:
                print(f"Custom download (Attempt {attempts}/{max_retries}): {url} -> {output_filename}")
                kwargs: dict[str, Any] = {"timeout": 60}
                if auth:
                    kwargs["auth"] = auth
                
                response = self.session.get(url, **kwargs)
                
                # Client requirement #4 & result check: overwrite exists because save_audio replaces file
                if response.status_code == 200 and len(response.content) > 100:
                    self.file_service.save_audio(response.content, station, output_filename, is_public=True)
                    print(f"Custom download OK: {output_filename} ({len(response.content)} bytes)")
                    return True
                
                print(f"Custom download attempt {attempts} failed: HTTP {response.status_code}")
            except Exception as e:
                print(f"Custom download attempt {attempts} error: {str(e)}")
            
            # Brief pause before retry if not the last attempt
            if attempts < max_retries:
                time.sleep(5)
                
        print(f"Custom download FAILED after {max_retries} attempts.")
        return False
