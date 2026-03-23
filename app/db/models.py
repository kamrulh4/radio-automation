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
