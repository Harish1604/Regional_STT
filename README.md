# 🗣️ Indic Voice Chat — Regional STT Chatbot

An end-to-end web application for a **multilingual Indian regional-language speech chatbot**. Speak in **Tamil, Hindi, Telugu, Malayalam, Kannada**, or other Indian languages — your speech is processed, transcribed using **AI4Bharat IndicConformer STT**, and sent to a **Gemini LLM** which dynamically replies in the **same regional language**.

---

## 🚀 Key Features

*   **Multilingual Speech-to-Text**: Converts real-time microphone recordings or uploaded audio files into text using AI4Bharat's state-of-the-art regional model.
*   **Contextual LLM Reasoning**: Integrates Google Gemini API to formulate human-like responses in the user's native tongue.
*   **Interactive Voice Chat UI**: A premium, responsive glassmorphism interface featuring dynamic recording visualization, history management, and debugging utilities.
*   **Dual Audio Pipeline**: Seamlessly supports both real-time browser recording and file uploads (supporting `.wav`, `.mp3`, `.ogg`, `.webm`, `.flac`, etc.).
*   **Developer-Friendly Diagnostics**: Includes an interactive debug panel to inspect backend latency, audio durations, model details, and logs.

---

## 🛠️ Technology Stack & Tools Used

### Frontend (User Interface)
*   **Framework**: [Next.js 14+](https://nextjs.org/) (React & TypeScript) utilizing App Router.
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) for fluid, modern utility-first styling.
*   **Icons**: [Lucide React](https://lucide.dev/) for high-quality clean interfaces.
*   **Audio Recording**: HTML5 `MediaRecorder` API with native `audio/webm;codecs=opus` streaming.

### Backend (API & Model Server)
*   **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.14 compatible) with asynchronous request handlers.
*   **Inference & Audio Processing**:
    *   **PyTorch** & **Torchaudio**: Deep learning frameworks running model inference.
    *   **AI4Bharat IndicConformer** (`ai4bharat/indic-conformer-600m-multilingual`): 600M parameter CTC-based multilingual Indian language ASR model.
    *   **Pydub** & **FFmpeg**: Handles audio transcoding, downsampling (to 16kHz mono), and format conversions.
*   **LLM Orchestration**:
    *   **Google GenAI SDK** (`google-genai`): Officially integrated to interact with Gemini API.
    *   **Ollama**: Local alternative option for offline usage (e.g., using `llama3`).
    *   **OpenAI**: Optional endpoint for GPT models.

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
│  🎤 Mic Recording  │  📁 Upload  │  💬 Chat UI  │  🔧 Debug │
└──────────────┬───────────────┬───────────────────────────────┘
               │               │
         POST /transcribe   POST /chat
         (audio + lang)     (text + lang + history)
               │               │
┌──────────────▼───────────────▼───────────────────────────────┐
│                     Backend (FastAPI)                         │
│                                                              │
│  Audio Service ──▶ STT Service ──▶ AI4Bharat IndicConformer  │
│                    (600M multilingual)                        │
│                                                              │
│  LLM Service ──▶ Gemini API (2.5 Flash)                      │
│                  (replies in same language)                   │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔧 Infrastructure & Platform Resolutions (Important Details)

During development, we resolved several critical runtime and compatibility issues to ensure stable deployment:

### 1. Python 3.14 Compatibility (`audioop` Removal)
Since Python 3.13+, the standard library's `audioop` module was deprecated and removed (under PEP 594). Certain PyTorch and audio processing libraries still require it.
*   **Resolution**: Integrated **`audioop-lts`** (a PyPI backport of the legacy C extension) into the virtual environment to maintain seamless processing compatibility on Python 3.14.

### 2. Torchaudio Loading Backend (`torchcodec` & `soundfile`)
Recent updates to PyTorch and Torchaudio default to using `TorchCodec` for audio file loading. 
*   **Resolution**: Installed and configured **`torchcodec`** and **`soundfile`** dependencies to prevent loading failures when opening webm/wav payloads.

### 3. Frontend Hydration Warnings
Browser extensions (such as Dark Reader) and local client characteristics sometimes inject HTML styling attributes that differ from the server-rendered Next.js skeleton.
*   **Resolution**: Implemented client-side mounting checks (`isMounted` state hooks) and `suppressHydrationWarning` flags in layout files to ensure complete component synchronization before rendering.

---

## 📂 Project Structure

```
regional-stt-chatbot/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app + lifespan
│   │   ├── config.py            # Settings from .env
│   │   ├── routes/
│   │   │   ├── health.py        # GET /health
│   │   │   ├── transcribe.py    # POST /transcribe
│   │   │   └── chat.py          # POST /chat
│   │   ├── services/
│   │   │   ├── stt_service.py   # AI4Bharat IndicConformer
│   │   │   ├── llm_service.py   # LLM abstraction (Gemini 2.5 Flash)
│   │   │   └── audio_service.py # Audio preprocessing (pydub + ffmpeg)
│   │   ├── models/
│   │   │   ├── request_models.py
│   │   │   └── response_models.py
│   │   ├── utils/
│   │   │   ├── file_utils.py
│   │   │   └── logger.py
│   │   └── prompts/
│   │       └── system_prompts.py
│   ├── requirements.txt         # Frozen backend dependencies
│   └── .env.example
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx           # Base layout + hydration fixes
│   │   ├── page.tsx             # Main interactive chat page
│   │   └── globals.css          # Styling overrides
│   ├── components/
│   │   ├── ChatWindow.tsx       # Message thread component
│   │   ├── ChatMessage.tsx      # Single speech bubble renderer
│   │   ├── RecorderControls.tsx # WebM recording logic
│   │   ├── LanguageSelector.tsx # Regional language picker
│   │   └── DebugPanel.tsx       # Live status indicators
│   ├── lib/
│   │   ├── api.ts               # Axios-based backend wrappers
│   │   └── recorder.ts          # Browser audio capture wrapper
│   └── .env.example
```

---

## ⚡ Setup & Installation

### Prerequisites
*   **Node.js**: `v18.0.0` or higher.
*   **Python**: `v3.10` up to `v3.14`.
*   **System Tools**: **FFmpeg** (must be installed and present on your system path).
    ```bash
    # Linux (Debian/Ubuntu)
    sudo apt update && sudo apt install -y ffmpeg
    
    # macOS
    brew install ffmpeg
    ```

---

### 1. Backend Setup

1.  **Navigate and set up Virtual Environment**:
    ```bash
    cd backend
    python -m venv venv
    source venv/bin/activate
    ```
2.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
3.  **Accept Model Terms**:
    To pull the gated IndicConformer model, visit [AI4Bharat on HuggingFace](https://huggingface.co/ai4bharat/indic-conformer-600m-multilingual) and accept the usage terms. Generate a token in your HuggingFace Settings page.
4.  **Configure Environment**:
    Create `.env` using `.env.example`:
    ```bash
    cp .env.example .env
    ```
    Add your configurations:
    ```env
    # HuggingFace & Device
    HF_TOKEN=your_huggingface_token
    STT_DEVICE=auto  # Resolves to cuda or cpu automatically
    
    # LLM Settings
    LLM_PROVIDER=gemini
    GEMINI_API_KEY=your_gemini_api_key
    GEMINI_MODEL=gemini-2.5-flash
    ```
5.  **Run backend**:
    ```bash
    python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    ```
    *Note: The first run takes several minutes to download the model (~2.5GB) to HuggingFace Cache.*

---

### 2. Frontend Setup

1.  **Navigate & Install Packages**:
    ```bash
    cd ../frontend
    npm install
    ```
2.  **Environment Setup**:
    ```bash
    cp .env.example .env.local
    ```
    *(The default `NEXT_PUBLIC_API_URL=http://localhost:8000` is pre-configured).*
3.  **Start Development Server**:
    ```bash
    npm run dev
    ```
4.  Open http://localhost:3000 in your browser!

---

## 📡 API Contract

### `POST /transcribe`
Converts raw audio file into text.
*   **Payload**: `multipart/form-data`
    *   `file`: Audio file (webm/wav/mp3)
    *   `language`: ISO 639-1 language code (e.g. `ta`, `hi`, `te`)
*   **Sample Response**:
    ```json
    {
      "success": true,
      "transcript": "வணக்கம் எப்படி இருக்கிறீர்கள்",
      "language": "ta",
      "model": "ai4bharat/indic-conformer-600m-multilingual",
      "audio_duration_sec": 3.89,
      "latency_ms": 1508
    }
    ```

### `POST /chat`
Submits text prompt along with conversational history to get a regional response.
*   **Payload**: `application/json`
    ```json
    {
      "message": "வணக்கம் எப்படி இருக்கிறீர்கள்",
      "language": "ta",
      "history": [
        { "role": "user", "text": "வணக்கம்" },
        { "role": "assistant", "text": "வணக்கம்! நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?" }
      ]
    }
    ```
*   **Sample Response**:
    ```json
    {
      "success": true,
      "reply": "நான் நன்றாக இருக்கிறேன், நீங்கள் எப்படி இருக்கிறீர்கள்?",
      "language": "ta",
      "latency_ms": 612
    }
    ```

---

## 🧠 Deep Dive: AI4Bharat & IndicConformer

[AI4Bharat](https://ai4bharat.iitm.ac.in/) is a research lab at **IIT Madras** focused on building open-source datasets, tools, and models for Indian languages. To address the unique linguistic diversity and resource constraints of Indian languages, AI4Bharat developed the **IndicConformer** suite.

### 1. IndicConformer Model Architecture
This application uses the **`ai4bharat/indic-conformer-600m-multilingual`** model, which contains **600 million parameters**:
* **Conformer-based Design**: It merges Transformer-style self-attention (ideal for capturing global context and long-range dependencies) with depthwise convolutions (ideal for local phonetic details). This hybrid design is exceptionally well-suited to handle the subtle sound changes, fast speech tempos, and varied regional accents across India.
* **Dual Decoding Strategy**:
  * **CTC (Connectionist Temporal Classification)**: Used by default in our backend (`self.decode_mode = "ctc"`). This strategy provides fast, parallel, non-autoregressive decoding suitable for server-side processing.
  * **RNNT (Recurrent Neural Network Transducer)**: Supports autoregressive streaming decoding, which is ideal for real-time, low-latency word-by-word transcription.

### 2. Dataset & Training Corpus
The model was trained on thousands of hours of diverse speech data across multiple Indian dialects, including datasets such as:
* **KathBath**: A crowdsourced dataset containing speech from 22 official Indian languages spoken across rural and urban regions to capture varied accents.
* **ULCA (Unified Language Contribution and Assimilation)**: A large-scale public data platform for Indian languages.
* **Shrutilipi & MUCS**: Audio corpora containing news broadcasts, conversational speech, and multi-domain vocabulary.

### 3. Supported Languages
While this chatbot defaults to the 10 most common languages, the underlying AI4Bharat model natively supports all **22 official scheduled languages of India**:
* **Dravidian**: Tamil (`ta`), Telugu (`te`), Malayalam (`ml`), Kannada (`kn`).
* **Indo-Aryan**: Hindi (`hi`), Bengali (`bn`), Gujarati (`gu`), Marathi (`mr`), Punjabi (`pa`), Urdu (`ur`), Odia (`or`), Assamese (`as`), Sanskrit (`sa`), Kashmiri (`ks`), Sindhi (`sd`), Konkani (`kok`), Dogri (`doi`), Maithili (`mai`), Nepali (`ne`).
* **Sino-Tibetan & Others**: Manipuri (`mni`), Bodo (`brx`), Santali (`sat`).

---

## 💡 Troubleshooting & Notes

*   **Phonetic Transcriptions**: Because the STT model operates on the target language code, speaking in English (e.g., "Hello how are you") while your language selector is set to Tamil (`ta`) will output phonetic Tamil words (`ஹலோ ஹவ் ஆர் யூ`). **Always speak in the language chosen in the frontend selector.**
*   **API Rate Limits**: If you run into `429 Resource Exhausted` exceptions, make sure your Gemini API key has appropriate quota limits or use `gemini-2.5-flash` which provides stable developer allowances.
*   **GPU Acceleration**: If your system has CUDA support, PyTorch will automatically run the IndicConformer model on CUDA, dropping transcription times significantly.
