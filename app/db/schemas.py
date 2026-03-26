from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class StationBase(BaseModel):
    name: str
    display_name: str
    is_active: bool = True

class StationCreate(StationBase):
    pass

class Station(StationBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    username: str
    role: str = "dj"
    is_active: bool = True
    assigned_station_id: Optional[int] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

class DownloadSourceBase(BaseModel):
    name: str
    url: str
    username: Optional[str] = None
    password: Optional[str] = None
    output_filename: str
    station_id: int
    is_active: bool = True
    schedule_minute: str = "0"
    schedule_hour: str = "*"
    schedule_day_of_week: str = "*"
    max_retries: int = 3

class DownloadSourceCreate(DownloadSourceBase):
    pass

class DownloadSource(DownloadSourceBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
