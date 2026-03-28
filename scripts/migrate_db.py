import sqlite3
import os

def migrate():
    db_path = "radio_automation.db"
    if not os.path.exists(db_path):
        print(f"Error: {db_path} not found.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        print("Migrating download_sources table...")
        # Check if columns already exist
        cursor.execute("PRAGMA table_info(download_sources)")
        columns = [column[1] for column in cursor.fetchall()]

        if "is_ai_mode" not in columns:
            print("Adding is_ai_mode column...")
            cursor.execute("ALTER TABLE download_sources ADD COLUMN is_ai_mode BOOLEAN DEFAULT 0")
        
        if "prompt_text" not in columns:
            print("Adding prompt_text column...")
            cursor.execute("ALTER TABLE download_sources ADD COLUMN prompt_text VARCHAR")
            
        if "ai_voice_id" not in columns:
            print("Adding ai_voice_id column...")
            cursor.execute("ALTER TABLE download_sources ADD COLUMN ai_voice_id VARCHAR")

        conn.commit()
        print("Migration completed successfully!")
    except Exception as e:
        print(f"Migration failed: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
