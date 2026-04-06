#!/bin/bash

# Exit on error
set -e

echo "🚀 Building Radio Automation Frontend (Local Mac)..."

# 1. Build Frontend
echo "📦 Installing Node dependencies and building..."
cd frontend
npm install
npm run build
cd ..

echo "✅ Frontend Build Ready!"
echo "Next: Push the 'frontend/dist' folder to GitHub and then run 'vps_setup_final.sh' on the VPS."
