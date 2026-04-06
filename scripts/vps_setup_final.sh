#!/bin/bash

# --- Radio Automation: One-File VPS Setup ---
# Run this on your VPS to install dependencies and prepare the service.

set -e

echo "------------------------------------------------"
echo "🚀 Starting Radio Automation Setup..."
echo "------------------------------------------------"

# 1. Update & Install Python 3.12 (Ultra-Reliable Method for Ubuntu 20.04)
echo "🐍 Installing Python 3.12 (Cleaning & Manual Setup)..."

# Clean up duplicate lists to avoid APT warnings
sudo rm -f /etc/apt/sources.list.d/deadsnakes*

# Install prerequisites
sudo apt update
sudo apt install -y curl gnupg2 software-properties-common

# Download the key using a different format (binary export)
# This bypasses all "no valid OpenPGP data" errors
sudo gpg --no-default-keyring --keyring /etc/apt/trusted.gpg.d/deadsnakes.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys F1D693057436DD7B

# Manually create the sources list file
echo "deb http://ppa.launchpad.net/deadsnakes/ppa/ubuntu focal main" | sudo tee /etc/apt/sources.list.d/deadsnakes.list

sudo apt update
sudo apt install -y python3.12 python3.12-venv python3.12-dev

# 2. Setup Virtual Environment
echo "🧪 Creating Python Virtual Environment..."
python3.12 -m venv venv
source venv/bin/activate
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
