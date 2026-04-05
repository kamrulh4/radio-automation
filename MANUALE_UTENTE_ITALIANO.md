# 📻 Piattaforma di Automazione Radio - Manuale Utente Completo

Benvenuto nella **Piattaforma di Automazione Radio**. Questo sistema professionale è progettato per automatizzare la generazione di contenuti audio (Meteo, News, Traffico) e la gestione di sorgenti dinamiche per l'integrazione con **RadioDJ**.

---

## 🚀 1. Panoramica delle Funzionalità

La piattaforma offre un set completo di strumenti per la gestione quotidiana di una o più stazioni radio:

-   **Multi-Stazione**: Gestione centralizzata di diverse emittenti con archiviazione separata.
-   **Sintesi Vocale (TTS)**: Integrazione con **ElevenLabs** per voci umane ultra-realistiche.
-   **Download Automatici**: Servizio integrato per scaricare Meteo, Notizie e Traffico (Lombardia) ogni ora.
-   **Sorgenti Dinamiche Personalizzate**: Configurazione di URL esterni con parametri temporali (es. `{YYYY}`, `{MM}`, `{DD}`).
-   **Modalità AI (Generazione Autonoma)**: Utilizzo di **Google Gemini** per scrivere testi e **ElevenLabs** per convertirli in audio basandosi su prompt personalizzati.
-   **Pianificazione Cron-style**: Controllo granulare su minuti, ore e giorni per ogni download.
-   **Integrazione Diretta RadioDJ**: I file vengono salvati con nomi fissi e sovrascritti automaticamente per una riproduzione senza interruzioni.

---

## 👥 2. Ruoli e Livelli di Accesso

### 🛡️ Amministratore (Manager)
-   **Controllo Totale**: Gestione delle stazioni radio e degli account utente.
-   **Configurazione Automazione**: L'unico ruolo che può configurare le **Sorgenti di Download Dinamiche** (URL, Orari, Credenziali).
-   **Impostazioni di Sistema**: Gestione delle chiavi API e dei parametri globali.

### 🎧 DJ (Staff)
-   **Operatività Quotidiana**: Accesso limitato alla dashboard della stazione assegnata.
-   **Generazione Manuale**: Può generare file audio tramite TTS o forzare i download standard (Meteo, News, Traffico).
-   **Nessuna Configurazione**: Non può modificare le impostazioni di sistema o le sorgenti pianificate.

---

## 📊 3. Dashboard DJ (Operazioni Quotidiane)

### 🎙️ Generazione Vocale AI (TTS)
1.  Seleziona la **Stazione** (se ne gestisci più di una).
2.  **🆕 Assistente AI per Script**: Se non hai ancora un testo pronto, usa il nuovo box "Assistente AI":
    -   Scrivi una breve descrizione (es. *"Scrivi un'introduzione energica per il programma del pomeriggio"*).
    -   Clicca su **Genera Testo con IA**.
    -   Il testo apparirà automaticamente nel modulo sottostante.
3.  Seleziona la **Voce** desiderata.
4.  Inserisci o modifica il **Testo** da convertire.
5.  Clicca su **Genera Audio**.
6.  Il file verrà creato istantaneamente e sarà visibile nella lista dei file della stazione.

### 📥 Download Manuali
Se hai bisogno di aggiornare i contenuti fuori dall'orario programmato:
-   Clicca sulle icone: 🌦️ (Meteo), 📰 (News), o 🚗 (Traffico).
-   Il sistema scaricherà immediatamente l'ultima versione disponibile dal provider.

---

## ⚙️ 4. Pannello Admin (Configurazione di Sistema)

### 📍 Gestione Stazioni e Utenti
-   **Stazioni**: Crea identificativi per le stazioni (es. `Radio_Garda`, `Radio_105`). Il sistema creerà automaticamente le cartelle necessarie in `storage/public/`.
-   **Utenti**: Crea account per i DJ e collegali alle rispettive stazioni.

### ⚡ Sorgenti di Download Dinamiche
Questa funzione permette di automatizzare i download da provider esterni.

1.  **Date Dinamiche negli URL**: Il sistema aggiorna automaticamente l'indirizzo di download in base al giorno, mese o anno corrente, permettendo di scaricare sempre l'ultimo contenuto disponibile.
2.  **Pianificazione Flessibile**: È possibile impostare orari precisi e giorni della settimana per ogni download automatico (es. ogni mezz'ora, solo nei fine settimana, ecc.).
3.  **Gestione Errori**: Il sistema esegue fino a **3 tentativi** in caso di errore del server provider.
4.  **Generazione basata su Prompt AI**:
    -   Invece di un URL, seleziona la modalità **AI Prompt**.
    -   Scrivi un comando per l'IA, ad esempio: *"Genera un breve sommario meteo per la zona del Lago di Garda per questa mattina, tono amichevole"*.
    -   Il sistema userà **Google Gemini** per redigere il testo e la voce selezionata per creare l'audio.

---

## 📂 5. Gestione File e Integrazione RadioDJ

### **Sovrascrittura Automatica**
Per garantire che **RadioDJ** riproduca sempre l'ultimo contenuto senza intervento manuale:
-   Ogni download (es. `news.mp3`) **sovrascrive** il file precedente nella cartella della stazione.
-   **RadioDJ** deve essere configurato per puntare a questi file fissi nella directory `./storage/public/[NomeStazione]/`.

### **Visualizzazione Stato**
Nella dashboard è presente una lista file che mostra l'orario esatto dell'ultimo aggiornamento per ogni file, permettendo di verificare a colpo d'occhio se le automazioni sono andate a buon fine.

---

## 🔑 6. Configurazione Chiavi API (Google Gemini)

Per utilizzare le funzioni di intelligenza artificiale per generare testi (come le notizie personalizzate), è necessario inserire una chiave API di Google Gemini.

1.  **Ottenere la Chiave**: Vai su [Google AI Studio](https://aistudio.google.com/) e crea una nuova "API Key".
2.  **Inserire la Chiave**:
    -   Accedi al **Pannello Admin** nella dashboard.
    -   Scorri fino alla sezione **Impostazioni di Sistema** (System Settings).
    -   Inserisci la chiave nel campo **Google Gemini API Key**.
    -   La chiave verrà salvata automaticamente e sarà pronta all'uso.

---

## 📰 7. Esempi di Contenuti IA (News, Meteo, Oroscopo)

Il sistema è flessibile: puoi creare infinite sorgenti automatiche. Ecco alcuni esempi di prompt che puoi usare:

-   **Notizie Locali**: *"Trova le ultime notizie sul Veneto di oggi, riassumile in 5 punti e crea un testo per uno speaker radiofonico di 2 minuti."*
-   **Meteo**: *"Genera le previsioni meteo per domani in Lombardia, tono amichevole e solare."*
-   **Oroscopo del Giorno**: *"Genera un breve oroscopo del giorno per tutti i segni zodiacali, stile moderno e rapido (massimo 10 secondi per segno)."*
-   **Traffico**: *"Cerca informazioni sul traffico in tempo reale sulla A4 e riassumile."*

Ogni sorgente creerà un file audio separato nella cartella della stazione, pronto per essere trasmesso da RadioDJ.

---

## 🆘 Supporto
-   **Log di Sistema**: Gli amministratori possono consultare la dashboard per messaggi di successo o errore nei download.
-   **Manutenzione**: Se una sorgente non è ancora stata pubblicata dal provider, il sistema riproverà automaticamente all'intervallo successivo configurato.

*Manuale aggiornato al: Aprile 2026*
