# 🚀 Final GitHub-to-VPS Deployment Guide

Follow these exact steps to host your project on the client's VPS.

---

### Step 1: Prepare the Code (On your Mac)
Since the VPS has no Node.js, we build on the Mac and send the results to GitHub.

1.  **Build the Frontend**:
    ```bash
    ./deploy.sh
    ```
2.  **Important**: Check if `frontend/dist` is in your `.gitignore`. If it is, remove it temporarily so you can push it to GitHub.
3.  **Push to GitHub**:
    ```bash
    git add .
    git commit -m "Build: Ready for VPS deployment"
    git push origin development
    ```

---

### Step 2: Get the Server Info (On VPS)
To host easily, I need to know your current ports. Run these and **paste the output**:
```bash
cat /etc/nginx/sites-enabled/libretime.conf
cat /etc/nginx/sites-enabled/play.conf
cat /etc/nginx/sites-enabled/voice.webradio.bz
sudo lsof -i :8000
```

---

### Step 3: Clone and Setup (On VPS)
1.  **Login to VPS**: `ssh administrator@81.88.25.57`
2.  **Clone the Repository**:
    ```bash
    git clone -b development https://github.com/kamrulh4/radio-automation.git
    cd radio-automation
    ```
3.  **Run the Final Setup Script**:
    ```bash
    chmod +x scripts/vps_setup_final.sh
    ./scripts/vps_setup_final.sh
    ```
    *This will install Python 3.12, set up the virtual environment, and start the background service.*

---

### Step 4: Final Nginx Web Access (On VPS)
Once you give me the output from **Step 2**, I will generate a custom `radio_automation.conf` file for you to paste into `/etc/nginx/sites-available/`.

---

### 🛡️ Monitoring & Backup Alert
1.  **Run the watchdog**:
    ```bash
    chmod +x scripts/monitor_streams.sh
    (crontab -l 2>/dev/null; echo "* * * * * /home/administrator/radio-automation/scripts/monitor_streams.sh") | crontab -
    ```

**Your system will then be live at `http://dj.webradio.bz` (after the client adds the DNS record)!**
