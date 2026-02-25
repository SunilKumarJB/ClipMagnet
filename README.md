# ClipMagnet 🎬🧲

ClipMagnet is a modern, visually stunning web application that leverages the power of Google Cloud's **Vertex AI Gemini 3.0** models to analyze long videos and automatically extract key "hook" scenes. 

Designed specifically for Video Editors and Content Strategists, ClipMagnet identifies high-tension, comedic, action-packed, or highly informative moments, drastically reducing the time required to scour footage for repurposing.

## ✨ Features
- **Intelligent Hook Extraction:** Analyzes entire videos chronologically to find retention-spiking moments.
- **Detailed Editor Metadata:** Extracts timestamps, scene descriptions, editing justifications, pacing/energy levels, and audio/visual cues for every hook.
- **Configurable AI Models:** Easily switch between different Vertex AI Gemini models (e.g., `gemini-3.0-pro`, `gemini-3.0-flash`) directly from the UI.
- **GCS Integration:** Upload files directly to a Google Cloud Storage bucket for robust enterprise processing.
- **Premium Glassmorphic UI:** A sleek, responsive React interface complete with smooth animations, interactive timestamp seeking, and dynamic Light/Dark mode.
- **Embedded Local Preview:** Instantly watch and seek to the extracted scenes using a fast local video URL implementation.

## 🏗️ Architecture
The project follows a decoupled monorepo structure:
- **`/frontend`**: A React application built with Vite and vanilla CSS. Handles the drag-and-drop UI and video rendering.
- **`/backend`**: A FastAPI Python application. Orchestrates video uploads and communicates with Vertex AI using the latest `google-genai` SDK.

## 🚀 Getting Started

### Prerequisites
1. **Python 3.9+** and **Node.js (npm)** installed.
2. A **Google Cloud Project** with the Vertex AI API enabled.
3. Authenticate your local environment with Google Cloud Application Default Credentials (ADC):
   ```bash
   gcloud auth application-default login
   ```

### Quick Start (Using Make)
The easiest way to set up and run the application is to use the `Makefile` located in the root directory.

1. **Install dependencies** (Backend & Frontend):
   ```bash
   make setup
   ```
2. **Start the application** (Runs both servers concurrently):
   ```bash
   make run
   ```

*To clean the environment (removes `node_modules` and `venv`), run `make clean`.*

### Manual Setup

<details>
<summary>Click here for step-by-step manual setup</summary>

#### 1. Backend Setup
Navigate to the backend directory and install the required dependencies:
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

> **Note for Googlers / Corp users:** If you face SSO connectivity issues during `pip install`, run `gcert` to authenticate your credentials first.

Copy the example environment variables and update them if needed:
```bash
cp .env.example .env
```
Start the FastAPI server:
```bash
uvicorn main:app --reload
```

#### 2. Frontend Setup
Open a new terminal, navigate to the frontend directory, and start the development server:
```bash
cd frontend
npm install
npm run dev
```

</details>

### 3. Usage
- Open `http://localhost:5173` in your browser.
- Click the **Config** (gear icon) to switch the Gemini model or define a GCS Bucket.
- Toggle between Light and Dark mode using the **Sun/Moon** icon.
- Drag and drop a video file into the upload zone and hit **Extract Hook Scenes**.
- Review the dynamically generated scene cards, complete with editor justification metadata and interactive seek badges!

## 🧪 Technologies Built With
- **Frontend**: React, Vite, Lucide React (Icons), Vanilla CSS
- **Backend**: Python, FastAPI, python-multipart, python-dotenv
- **AI**: Google Cloud Vertex AI SDK (`google-genai`), Gemini 3.0 Models
- **Auth**: Google Cloud ADC

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.
