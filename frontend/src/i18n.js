import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "app_title": "Radio Automation",
      "login": "Login",
      "password": "Password",
      "submit": "Submit",
      "logout": "Logout",
      "tts_title": "Text to Speech",
      "downloads_title": "Automated Downloads",
      "station": "Station",
      "voice": "Voice",
      "text_input": "Enter text to generate audio...",
      "generate": "Generate Audio",
      "upload": "Upload File",
      "recent_files": "Recent Files",
      "trigger_meteo": "Refresh Weather (Meteo)",
      "trigger_news": "Refresh News",
      "trigger_traffic": "Refresh Traffic",
      "status": "Status",
      "quota": "ElevenLabs Quota",
      "success": "Operation successful",
      "error": "An error occurred"
    }
  },
  it: {
    translation: {
      "app_title": "Automazione Radio",
      "login": "Accedi",
      "password": "Password",
      "submit": "Invia",
      "logout": "Esci",
      "tts_title": "Sintesi Vocale (TTS)",
      "downloads_title": "Download Automatici",
      "station": "Stazione",
      "voice": "Voce",
      "text_input": "Inserisci il testo per generare l'audio...",
      "generate": "Genera Audio",
      "upload": "Carica File",
      "recent_files": "File Recenti",
      "trigger_meteo": "Aggiorna Meteo",
      "trigger_news": "Aggiorna Notizie",
      "trigger_traffic": "Aggiorna Traffico",
      "status": "Stato",
      "quota": "Quota ElevenLabs",
      "success": "Operazione riuscita",
      "error": "Si è verificato un errore",
      "sources_title": "Sorgenti Download Dinamici",
      "add_source": "Aggiungi Sorgente",
      "source_name": "Nome Sorgente",
      "output_filename": "File Output (es. news.mp3)",
      "username": "Username (opzionale)",
      "password": "Password (opzionale)",
      "trigger": "Scarica Ora",
      "minute": "Minuto (0-59)",
      "hour": "Ora (0-23)",
      "days": "Giorni (0=Lun, 6=Dom)",
      "retries": "Tentativi retry"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'it',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
