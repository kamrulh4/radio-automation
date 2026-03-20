# Radio Automation Platform

Professional automation platform for multiple radio stations.

## Quick Start (Phase 1)

### 1. Backend Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Configure your keys
# Edit the .env file and add your ELEVENLABS_API_KEY
```

### 2. Running the Server
```bash
python run.py
```
The API will be available at `http://localhost:8000`.
Documentation: `http://localhost:8000/docs`

### 3. Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
```
The dashboard will be available at `http://localhost:5173`.

### 4. Storage Structure
- `storage/stations/`: Internal files for each station.
- `storage/public/`: Publicly accessible files for RadioDJ pull.
  Example URL: `http://localhost:8000/public/Radio_Garda/news.mp3`

## Features
- Multi-station management.
- ElevenLabs TTS integration.
- Automated downloads (Meteo, News, Traffic).
- Dual-language (EN/IT) web dashboard.
- Drag & Drop file uploads.
