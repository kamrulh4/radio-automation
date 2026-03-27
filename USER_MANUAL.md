# 📻 Radio Automation Platform - User Manual

Welcome to the **Radio Automation Platform**. This system is designed to automate the generation of Audio content (Meteo, News, Traffic) and the scheduled download of dynamic sources for **RadioDJ** integration.

---

## 👥 1. Access Levels & Roles

The platform uses **Role-Based Access Control (RBAC)** to ensure security and ease of use:

### 🛡️ Administrator (Manager)
- **Full Access**: Can manage Radio Stations and create User accounts.
- **Automation Control**: The ONLY user who can configure **Dynamic Download Sources** (URLs, Schedules, Credentials).
- **Dashboard**: Has access to all DJ features plus the Admin Panel.

### 🎧 DJ (Staff)
- **Restricted Access**: Can only see the dashboard for their **assigned station**.
- **Daily Operations**: Can generate TTS (Text-to-Speech) and manually trigger standard downloads (Meteo, News, Traffic).
- **No Configuration**: Cannot change system settings, URLs, or schedules.

---

## 📊 2. DJ Dashboard (Daily Operations)

### 🎙️ AI Voice Generation (TTS)
1. Select your station (if you manage multiple).
2. Enter the text for your radio segment.
3. Choose a voice (powered by ElevenLabs).
4. Click **"Genera Audio"**.
5. The file will be saved and visible in the **File List**.

### 📥 Manual Downloads
If you need to update the Meteo, News, or Traffic outside the automatic schedule:
- Click the icons for 🌦️ (Meteo), 📰 (News), or 🚗 (Traffic).
- The system will immediately fetch the latest version from the provider.

---

## ⚙️ 3. Admin Panel (System Configuration)

Accessibility: **Admin-Only** via the "Settings" tab in the navigation bar.

### 📍 Station & User Management
- **Stations**: Create system-level station IDs (e.g., `Radio_Garda`, `Radio_105`). The system automatically creates matching folders in the storage.
- **Users**: Create DJ accounts and link them to specific stations.

### ⚡ Dynamic Download Sources (Advanced Scheduling)
This feature allows you to automate downloads from 3rd party providers (e.g., your news network).

#### **Key Features:**
1.  **URL Placeholders**: Handle daily-changing URLs automatically.
    - `{YYYY}`: Current Year (e.g., 2026)
    - `{MM}`: Current Month (e.g., 03)
    - `{DD}`: Current Day (e.g., 26)
    - `{date}`: Complete date (YYYY-MM-DD)
2.  **Flexible Scheduling (Cron-style)**:
    - **Minutes**: `0`, `30`, `*/15` (every 15 min), `*` (every min).
    - **Hours**: `8`, `21`, `9-17` (work hours), `*` (every hour).
    - **Days**: `mon-fri`, `0-6` (0=Sunday), `sat,sun`, `*` (every day).
3.  **Automatic Retries**: If a provider's server is down, the system will **retry 3 times** with a 5-second delay before stopping until the next scheduled cycle.
4.  **AI Prompt Generation (NEW - Phase 3)**:
    - Instead of a URL, select **AI Prompt** mode.
    - Write a prompt like *"Generate today's morning weather summary for Brescia in 2 sentences"*.
    - Select any **AI voice** from your ElevenLabs account (The list is fetched dynamically from your account).
    - On your schedule, the system will use **Google Gemini** to write the text and **ElevenLabs** to create the audio.

---

## 📂 4. File Management & RadioDJ Integration

### **Automatic Overwriting**
To ensure **RadioDJ** always plays the latest content without manual intervention:
- Every time a file is downloaded (e.g., `news.mp3`), the system **overwrites** the existing file in the station folder.
- **RadioDJ** should be configured to point to these fixed filenames in the `./storage/public/[StationName]/` directory.

### **File Resolutions**
- All files are saved in high-quality **MP3** format.
- A **File List** in the dashboard allows you to verify the exact time each file was last updated.

---

## 🆘 Support & Maintenance
- **Logs**: Administrators can see download success/error messages in the server console.
- **Retries**: If a source is missing (e.g., the news isn't uploaded yet), the system will automatically try again in the next scheduled interval.
