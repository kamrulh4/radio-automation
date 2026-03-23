import asyncio
import os
from .database import engine, Base, AsyncSessionLocal
from .models import User, Station
from ..core.config import settings
import bcrypt

async def init_models():
    async with engine.begin() as conn:
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)

async def seed_db():
    async with AsyncSessionLocal() as session:
        # Seed Stations from settings.STATIONS (which comes from .env)
        # settings.STATIONS is likely a list like ["Radio_Garda", "Radio_105"]
        for station_name in settings.STATIONS:
            # Check if exists
            # For simplicity in init, we just add if not present
            from sqlalchemy import select
            stmt = select(Station).where(Station.name == station_name)
            result = await session.execute(stmt)
            if not result.scalars().first():
                new_station = Station(
                    name=station_name,
                    display_name=station_name.replace("_", " ")
                )
                session.add(new_station)
        
        admin_stmt = select(User).where(User.username == "admin")
        admin_result = await session.execute(admin_stmt)
        if not admin_result.scalars().first():
            # Hashing with bcrypt directly
            pwd_bytes = settings.ADMIN_PASSWORD.encode('utf-8')
            salt = bcrypt.gensalt()
            hashed_pwd = bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')
            
            admin_user = User(
                username="admin",
                hashed_password=hashed_pwd,
                role="admin"
            )
            session.add(admin_user)
            
        await session.commit()

async def main():
    print("Initializing Database...")
    await init_models()
    print("Tables created.")
    print("Seeding initial data from .env...")
    await seed_db()
    print("Database seeding complete.")

if __name__ == "__main__":
    asyncio.run(main())
