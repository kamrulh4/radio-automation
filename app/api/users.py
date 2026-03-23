from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from ..db.database import get_db
from ..db.models import User as DBUser, Station as DBStation
from ..db.schemas import UserCreate, User
from .auth import get_admin_user, get_password_hash

router = APIRouter()

@router.get("/", response_model=List[User])
async def read_users(
    db: AsyncSession = Depends(get_db), 
    admin_user = Depends(get_admin_user)
):
    result = await db.execute(select(DBUser))
    return result.scalars().all()

@router.post("/", response_model=User)
async def create_user(
    user: UserCreate, 
    db: AsyncSession = Depends(get_db),
    admin_user = Depends(get_admin_user)
):
    # Check username
    result = await db.execute(select(DBUser).where(DBUser.username == user.username))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Username already registered")
        
    # Check station validation if DJ
    if user.role == "dj" and user.assigned_station_id:
        station_res = await db.execute(select(DBStation).where(DBStation.id == user.assigned_station_id))
        if not station_res.scalars().first():
            raise HTTPException(status_code=400, detail="Assigned station does not exist")
            
    hashed_pwd = get_password_hash(user.password)
    db_user = DBUser(
        username=user.username,
        hashed_password=hashed_pwd,
        role=user.role,
        is_active=user.is_active,
        assigned_station_id=user.assigned_station_id
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user
