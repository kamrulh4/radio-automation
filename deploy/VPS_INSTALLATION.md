# 🚀 VPS Installation Guide

This guide will help you install the **Radio Automation Platform** on an Ubuntu/Debian VPS.

## 📋 Prerequisites

-   **Python 3.10+**
-   **Node.js 18+ & npm**
-   **Nginx** (for serving the frontend)
-   **Git**

---

## 🛠️ 1. Clone & Environment Setup

```bash
# Clone the repository
git clone <repository-url>
cd radio_automation

# Setup Python Virtual Environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env file
cp .env.example .env
nano .env
```

### **Required .env Variables:**
-   `ELEVENLABS_API_KEY`: Your API key from elevenlabs.io
-   `GEMINI_API_KEY`: Your API key from Google AI Studio
-   `ADMIN_PASSWORD`: A strong password for the Admin Panel
-   `SECRET_KEY`: A random string (e.g., `openssl rand -hex 32`)

---

## 🖥️ 2. Frontend Build

```bash
cd frontend
npm install
npm run build
```
This will create a `dist` folder. We will serve this with Nginx.

---

## ⚙️ 3. Backend Service (systemd)

Create a service file to keep the backend running autonomously.

```bash
sudo nano /etc/systemd/system/radio_automation.service
```

**Paste the following (replace path/user):**
```ini
[Unit]
Description=Radio Automation Backend
After=network.target

[Service]
User=root
WorkingDirectory=/path/to/radio_automation
Environment="PATH=/path/to/radio_automation/venv/bin"
ExecStart=/path/to/radio_automation/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable radio_automation
sudo systemctl start radio_automation
```

---

## 🌐 4. Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/radio_automation
```

**Configuration:**
```nginx
server {
    listen 80;
    server_name your_domain_or_ip;

    root /path/to/radio_automation/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /public {
        alias /path/to/radio_automation/storage/public;
        autoindex on;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/radio_automation /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 📂 5. Storage Permissions

Important for RadioDJ integration:
```bash
chmod -R 777 /path/to/radio_automation/storage
```

Now the platform is live! Access it via your VPS IP or Domain.
