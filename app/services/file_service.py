import os
import shutil
from datetime import datetime
from typing import List, Dict, Optional
from ..core.config import settings

class FileService:
    """Manages station-specific and public file storage"""
    
    def __init__(self):
        self.base_path = settings.STORAGE_PATH
        
    def save_audio(self, audio_data: bytes, station: str, filename: str, 
                   is_public: bool = True) -> str:
        """Save audio file to station folder or public folder"""
        sub_dir = "public" if is_public else "stations"
        target_dir = os.path.join(self.base_path, sub_dir, station)
        os.makedirs(target_dir, exist_ok=True)
        
        # Ensure .mp3 extension
        if not filename.endswith(".mp3"):
            filename = f"{filename}.mp3"
            
        filepath = os.path.join(target_dir, filename)
        
        with open(filepath, "wb") as f:
            f.write(audio_data)
            
        return filepath
        
    def get_station_files(self, station: str, is_public: bool = True) -> List[Dict]:
        """List all audio files for a station"""
        sub_dir = "public" if is_public else "stations"
        target_dir = os.path.join(self.base_path, sub_dir, station)
        
        if not os.path.exists(target_dir):
            return []
            
        files = []
        for filename in os.listdir(target_dir):
            if filename.endswith(".mp3"):
                filepath = os.path.join(target_dir, filename)
                stats = os.stat(filepath)
                files.append({
                    "name": filename,
                    "size": stats.st_size,
                    "modified": datetime.fromtimestamp(stats.st_mtime).isoformat(),
                    "url": f"/public/{station}/{filename}" if is_public else None
                })
        return sorted(files, key=lambda x: x["modified"], reverse=True)

    def cleanup_old_files(self, station: str, days: int = 30):
        """Delete files older than N days"""
        # Implementation for later if needed
        pass
