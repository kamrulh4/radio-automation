# 🎥 Demo Script: Guided Walkthrough

Use this script for your "Short video call or guided demo" to impress the client and secure final approval.

## 🏁 Introduction
-   **Goal**: Demonstrate the full AI-driven autonomous workflow.

---

## 🛠️ Step 1: Admin Panel & Voice Management
-   **Action**: Go to the "Admin" tab.
-   **Show**: Explain that you fixed the voice selection.
-   **Demo**:
    -   Click on "Create new source" (AI Prompt mode).
    -   Open the **"Select AI Voice"** dropdown.
    -   **Point out**: "Now the platform fetches your real ElevenLabs voices directly. You can choose any voice from your account, not just a hardcoded list."
    -   Select a voice (e.g., Rachel or Antoni).

---

## ✍️ Step 2: AI Prompt Configuration
-   **Action**: Fill in an AI Prompt.
-   **Demo**:
    -   Enter a prompt like: *"Generate a 20-second news bulletin about local sports for Radio Garda, with a professional tone."*
    -   Set a **Schedule** (explain the cron-style: `0 * * * *` means every hour at minute 0).
    -   Explain the **Output Filename** (e.g., `news_garda.mp3`).
    -   Click "Add Source".

---

## 🚀 Step 3: Full Workflow (Prompt → AI → Audio → Distribution)
-   **Action**: Find the new source in the table and click the **"Trigger"** icon (Radio icon).
-   **Explanation**: "This manually triggers the same logic that runs automatically on the schedule. It will query Gemini, then ElevenLabs, then save the file."
-   **Result**: Wait a few seconds, then point to the "Dashboard" tab or the "File List".
-   **Show**: Locate `news_garda.mp3` in the station's file list. Show the timestamp.

---

## 📻 Step 4: RadioDJ Distribution
-   **Action**: (Explanation only)
-   **Show**: Point to the `storage/public/[StationName]` folder.
-   **Explanation**: "Every time AI generates a new version, it **overwrites** this specific file. You just point RadioDJ to this static URL/FilePath, and it will always have the freshest content without you lifting a finger."

---

## ✅ Step 5: Wrap-up & Feedback
-   **Action**: Ask if any part of the workflow needs more explanation.
-   **Highlight**: "The system is now running autonomously on the VPS. It handles retries, scheduling, and high-quality voice synthesis and text generation."
