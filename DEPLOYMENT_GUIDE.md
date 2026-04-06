# 🚀 Radio Automation Deployment Guide (Final)

This guide takes you from your local Mac to the production VPS in 4 easy steps.

---

### Step 1: Build the Frontend (Local Mac)
Since the VPS doesn't have Node.js, we build the "web" files locally.
1.  Open your terminal in the `radio_automation` folder.
2.  Run the build script:
    ```bash
    ./deploy.sh
    ```
    *This will create the `frontend/dist` folder.*

---

### Step 2: Upload Files to VPS
Now, send your entire project folder to the server.
1.  Run this command (it will ask for the password: `9FTeH0S1WAju4Is6`):
    ```bash
    scp -r ../radio_automation administrator@81.88.25.57:/home/administrator/
    ```

---

### Step 3: Server Setup (On VPS)
Login to the VPS and run the auto-setup script.
1.  SSH into the VPS:
    ```bash
    ssh administrator@81.88.25.57
    ```
2.  Enter the project folder and run the final setup:
    ```bash
    cd radio_automation
    chmod +x scripts/vps_setup_final.sh
    ./scripts/vps_setup_final.sh
    ```
    *This script installs Python 3.12, creates a virtual environment, and starts the service on port **8001**.*

---

### Step 4: Configure Nginx (On VPS)
To make your dashboard accessible via a web browser, we need to tell Nginx where it is.
1.  Create a new config file:
    ```bash
    sudo nano /etc/nginx/sites-available/radio_automation
    ```
2.  **Paste this configuration**:
    *(Change `your_domain_or_ip` to your server's IP address or a subdomain)*
    ```nginx
    server {
        listen 80;
        server_name 81.88.25.57; # Or your subdomain

        root /home/administrator/radio_automation/frontend/dist;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /api {
            proxy_pass http://localhost:8001;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location /public {
            alias /home/administrator/radio_automation/storage/public;
            autoindex on;
        }
    }
    ```
3.  **Enable the site**:
    ```bash
    sudo ln -s /etc/nginx/sites-available/radio_automation /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    ```

---

### 🛡️ Monitoring & Backup
To keep the system alive and healthy, set up the monitoring script:
1.  Make the monitor script executable:
    ```bash
    chmod +x scripts/monitor_streams.sh
    ```
2.  Add it to your cron job (runs every minute):
    ```bash
    (crontab -l 2>/dev/null; echo "* * * * * /home/administrator/radio_automation/scripts/monitor_streams.sh") | crontab -
    ```

**Your system is now ready for production!**
