#!/bin/bash

# Configuration
SERVICES=("radio_automation.service" "nginx.service") # Add your streaming services here (e.g., icecast2, liquidsoap)
LOG_FILE="/var/log/radio_monitor.log"
RESTART_ON_FAILURE=true

echo "[$(date)] --- Starting Stream Monitoring ---" >> "$LOG_FILE"

for SERVICE in "${SERVICES[@]}"; do
    if systemctl is-active --quiet "$SERVICE"; then
        echo "[$(date)] OK: $SERVICE is running." >> "$LOG_FILE"
    else
        echo "[$(date)] CRITICAL: $SERVICE is down!" >> "$LOG_FILE"
        
        if [ "$RESTART_ON_FAILURE" = true ]; then
            echo "[$(date)] Attempting to restart $SERVICE..." >> "$LOG_FILE"
            systemctl restart "$SERVICE"
            
            # Wait a few seconds and check again
            sleep 5
            if systemctl is-active --quiet "$SERVICE"; then
                echo "[$(date)] SUCCESS: $SERVICE was restarted." >> "$LOG_FILE"
            else
                echo "[$(date)] FAILED: $SERVICE could not be restarted." >> "$LOG_FILE"
                # TODO: Trigger external alert (e.g., Email, Telegram, or switch to Radio Link)
            fi
        fi
    fi
done

echo "[$(date)] --- Monitoring Finished ---" >> "$LOG_FILE"
