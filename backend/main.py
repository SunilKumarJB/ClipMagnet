from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import shutil
import uuid
from dotenv import load_dotenv

load_dotenv() # Load variables from .env file

# We will import our gemini service later
import gemini_service

app = FastAPI(title="Hook Scene Extractor API")

# Setup CORS for the Vite React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Temporary directory for saving uploaded videos before processing
TEMP_DIR = "/tmp/hook_scene_extractor_uploads"
os.makedirs(TEMP_DIR, exist_ok=True)

class ExtractionResult(BaseModel):
    status: str
    message: str
    scenes: list | None = None

@app.get("/api/config")
async def get_config():
    return {
        "available_models": [
            "gemini-3-pro-preview",
            "gemini-3-flash-preview",
            "gemini-2.5-pro",
            "gemini-2.0-flash-exp"
        ],
        "default_model": "gemini-3-pro-preview"
    }

@app.post("/api/extract", response_model=ExtractionResult)
async def extract_scenes(
    file: UploadFile = File(...),
    model_id: str | None = Form(None),
    gcs_bucket: str | None = Form(None)
):
    # Fallback to defaults from .env if not provided by frontend
    if not model_id:
        model_id = os.getenv("DEFAULT_MODEL", "gemini-3-pro-preview")
    
    if not gcs_bucket:
        gcs_bucket = os.getenv("GCS_BUCKET")

    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    # Save the file temporarily
    file_id = str(uuid.uuid4())
    temp_file_path = os.path.join(TEMP_DIR, f"{file_id}_{file.filename}")
    
    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        print(f"File saved to {temp_file_path}, processing with model {model_id}...")
        
        # Call the Gemini Service to process the video
        scenes_data = await gemini_service.process_video(
            video_path=temp_file_path,
            mime_type=file.content_type,
            model_id=model_id,
            gcs_bucket=gcs_bucket
        )
        
        return ExtractionResult(status="success", message="Extraction complete", scenes=scenes_data)
        
    except Exception as e:
        print(f"Error processing video: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing video: {str(e)}")
    finally:
        # Cleanup
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
            
@app.get("/")
async def root():
    return {"message": "Hook Scene Extractor API is running"}
