from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="dj") # "admin" or "dj"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship to assigned station (optional for admins)
    assigned_station_id = Column(Integer, ForeignKey("stations.id"), nullable=True)
    station = relationship("Station", back_populates="users")

class Station(Base):
    __tablename__ = "stations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True) # e.g. "Radio_Garda"
    display_name = Column(String) # e.g. "Radio Garda"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="station")

class DownloadLog(Base):
    __tablename__ = "download_logs"

    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(Integer, ForeignKey("stations.id"))
    type = Column(String) # "meteo", "news", "traffic"
    status = Column(String) # "success", "error"
    message = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

class DownloadSource(Base):
    """Custom download sources configured by admin from the UI"""
    __tablename__ = "download_sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)                              # Label, e.g. "Morning News FR3"
    url = Column(String)                               # Full download URL
    username = Column(String, nullable=True)            # Optional HTTP Basic Auth
    password = Column(String, nullable=True)
    output_filename = Column(String)                   # e.g. "news_fr3.mp3"
    station_id = Column(Integer, ForeignKey("stations.id"))
    is_active = Column(Boolean, default=True)
    
    # Scheduling fields (Cron-style)
    schedule_minute = Column(String, default="0")      # "0", "30", "*", "*/5"
    schedule_hour = Column(String, default="*")        # "8", "21", "*", "9-17"
    schedule_day_of_week = Column(String, default="*") # "mon-fri", "sat,sun", "*", "0-6"
    
    # AI Automation fields (Phase 3)
    is_ai_mode = Column(Boolean, default=False)
    prompt_text = Column(String, nullable=True)
    ai_voice_id = Column(String, nullable=True)
    
    max_retries = Column(Integer, default=3)           # Client asked for 2-3 retries
    
    created_at = Column(DateTime, default=datetime.utcnow)

    station = relationship("Station")
