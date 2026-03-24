import uvicorn
import os
from app.core.config import ensure_storage

if __name__ == "__main__":
    # Ensure storage exists before starting
    ensure_storage()
    
    # Start the server
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
