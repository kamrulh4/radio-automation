#!/bin/bash

# --- Radio Automation: One-File VPS Setup ---
# Run this on your VPS to install dependencies and prepare the service.

set -e

echo "------------------------------------------------"
echo "🚀 Starting Radio Automation Setup..."
echo "------------------------------------------------"

# 1. Verification of Python 3.14 (User installed manually)
if ! command -v python3.14 &> /dev/null
then
    echo "❌ Python 3.14 is not installed. Please install it first!"
    exit 1
fi
echo "🐍 Python 3.14 detected. Continuing..."

# 2. Setup Virtual Environment (Safe method for portable python)
echo "🧪 Creating Python Virtual Environment..."
# Some portable versions don't have ensurepip, so we skip it during creation
python3.14 -m venv venv --without-pip
source venv/bin/activate

# Manually install pip if it's missing
if ! command -v pip &> /dev/null
then
    echo "📦 Pip is missing in venv. Installing manually..."
    curl -sS https://bootstrap.pypa.io/get-pip.py | python3.14
fi

pip install --upgrade pip
pip install -r requirements.txt

# 3. Ensure Storage Permissions
echo "📂 Setting up storage permissions..."
mkdir -p storage/public
mkdir -p storage/stations
chmod -R 777 storage

# 4. Create Systemd Service
echo "⚙️ Creating Systemd Service..."
USERNAME=$(whoami)
WORKDIR=$(pwd)

cat <<EOF | sudo tee /etc/systemd/system/radio_automation.service
[Unit]
Description=Radio Automation Backend
After=network.target

[Service]
User=$USERNAME
WorkingDirectory=$WORKDIR
Environment="PATH=$WORKDIR/venv/bin"
ExecStart=$WORKDIR/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8003
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable radio_automation
sudo systemctl start radio_automation

echo "------------------------------------------------"
echo "✅ Setup Complete!"
echo "------------------------------------------------"
echo "The backend is now running on port 8001."
echo "Important: Since you built the frontend on your Mac,"
echo "make sure the 'frontend/dist' folder was uploaded."
echo ""
echo "Next: Configure Nginx to point to this new service."
