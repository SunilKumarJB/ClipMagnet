import os
import json
from google import genai
from google.genai import types

def get_client() -> genai.Client:
    """Initialize and return the genai Client."""
    project = os.getenv("GCP_PROJECT_ID")
    location = os.getenv("GCP_LOCATION", "us-central1")
    
    if project:
        print(f"Initializing Vertex AI client for project {project} in {location}")
        return genai.Client(vertexai=True, project=project, location=location)
        
    return genai.Client()

async def process_video(video_path: str, mime_type: str, model_id: str, gcs_bucket: str = None):
    """
    Upload the video to Gemini or GCS and prompt for hook scene extraction.
    """
    client = get_client()
    uploaded_file = None
    blob = None
    
    if gcs_bucket:
        # Use Google Cloud Storage
        from google.cloud import storage
        print(f"Uploading file {video_path} to gs://{gcs_bucket}...")
        storage_client = storage.Client()
        bucket = storage_client.bucket(gcs_bucket)
        blob_name = os.path.basename(video_path)
        blob = bucket.blob(blob_name)
        
        blob.upload_from_filename(video_path, content_type=mime_type)
        gcs_uri = f"gs://{gcs_bucket}/{blob_name}"
        print(f"Uploaded file to {gcs_uri}")
        
        # Create a Part from the GCS URI
        video_part = types.Part.from_uri(file_uri=gcs_uri, mime_type=mime_type)
        
    else:
        # Fallback: Upload the file using the genai interface
        print(f"Uploading file {video_path} to Gemini Files API...")
        uploaded_file = client.files.upload(file=video_path, config={'mime_type': mime_type})
        print(f"Uploaded file as {uploaded_file.name}")
        
        import time
        timeout = 300 # 5 minutes max wait
        start_time = time.time()
        
        while True:
            file_info = client.files.get(name=uploaded_file.name)
            if file_info.state == types.FileState.ACTIVE:
                print("File is active and ready for inference.")
                break
            elif file_info.state == types.FileState.FAILED:
                raise Exception("File processing failed.")
            
            if time.time() - start_time > timeout:
                raise Exception("Timeout waiting for file to process.")
                
            print("Waiting for file to be ready...")
            time.sleep(5)
            
        video_part = uploaded_file
    
    # Now that the file is ready, construct the prompt
    prompt = """
    Act as an elite Senior Video Editor, Content Strategist, and Post-Production AI Assistant. Your task is to analyze the provided video file in its ENTIRETY, from the very first second (00:00) to the very final frame. 

    Your objective is to extract EVERY possible "hook," key scene, retention spike, and viral moment. Because this is a large video, you must process it chronologically and meticulously. Do not summarize, do not skip the middle portions, and do not stop early. 

    ### 1. WHAT TO LOOK FOR (Hook Categories)
    Identify scenes that fit into the following structural/emotional categories:
    - Curiosity Gap / Suspense (Moments that make the viewer ask, "What happens next?")
    - High-Impact Action (Sudden visual or physical movement)
    - Comedic Beat (Jokes, funny reactions, or awkward silences)
    - Emotional / Profound (Vulnerability, drama, or deep insights)
    - Controversial / Hot Take (Strong opinions or pattern-interrupting statements)
    - Core Information (The essential "meat" of the video's value proposition)

    ### 2. REQUIRED METADATA & OUTPUT FORMAT
    For every single hook or key scene you identify, use the following metadata list that needs to be extracted:

    **[Scene Title: Short, punchy, descriptive]**
    *   **Timestamps:** [Start MM:SS] - [End MM:SS] 
    *   **Category:** [e.g., Curiosity Gap / Comedic Beat]
    *   **Content Summary:** [1-2 sentences explaining what is happening/being said]
    *   **The Hook Mechanic:** [Editing Justification: Why does this retain attention? Is it shock value, relatability, a visual pattern interrupt, or a dramatic question?]
    *   **Visuals & Camera:** [Describe framing, movement, lighting, or key visual elements—e.g., "Fast pan to medium close-up," "Static wide shot," "Subject breaks eye contact"]
    *   **Audio & Cues:** [Quote the exact impactful dialogue. Note shifts in music, sound effects, or vocal tone—e.g., "Voice drops to a whisper," "Sudden loud noise"]
    *   **Pacing & Energy:** [e.g., Frenetic, Slow-burn, High-energy, Deadpan]
    *   **Repurposing Idea:** [Where this clip belongs—e.g., YouTube Shorts, Video Intro Teaser, B-roll overlay]

    ---

    ### 3. STRICT PROCESSING CONSTRAINTS (CRITICAL)
    1. Segment your mental processing. Evaluate the video chronologically to ensure you do not miss hidden hooks in the middle or end of the video.
    2. Ensure highly precise timestamps. 
    3. Print the text `[END OF VIDEO REACHED: MM:SS]` at the very bottom of your response to confirm you have successfully analyzed the file to the final second.

    Begin your chronological analysis now.
    """
    
    # We define a strict JSON schema for the output
    response_schema = {
        "type": "ARRAY",
        "description": "A list of extracted hook scenes.",
        "items": {
            "type": "OBJECT",
            "properties": {
                "title": {"type": "STRING"},
                "start_timestamp": {"type": "STRING", "description": "MM:SS format e.g., 01:23"},
                "end_timestamp": {"type": "STRING", "description": "MM:SS format e.g., 01:45"},
                "category": {"type": "STRING"},
                "description": {"type": "STRING"},
                "editing_justification": {"type": "STRING", "description": "Why this scene is a strong hook."},
                "visuals_camera": {"type": "STRING", "description": "Notes on camera movement and framing."},
                "audio_cues": {"type": "STRING", "description": "Key dialogue or sound notes."},
                "pacing": {"type": "STRING", "description": "Energy level or pacing notes."},
            },
            "required": ["title", "start_timestamp", "end_timestamp", "category", "description", "editing_justification", "visuals_camera", "audio_cues", "pacing"]
        }
    }
    
    print(f"Prompting the model ({model_id}) with the video...")
    
    try:
        response = client.models.generate_content(
            model=model_id,
            contents=[video_part, prompt],
            config=types.GenerateContentConfig(
               temperature = 1,
                top_p = 0.95,
                max_output_tokens = 65535,
                safety_settings = [types.SafetySetting(
                    category="HARM_CATEGORY_HATE_SPEECH",
                    threshold="OFF"
                ),types.SafetySetting(
                    category="HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold="OFF"
                ),types.SafetySetting(
                    category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold="OFF"
                ),types.SafetySetting(
                    category="HARM_CATEGORY_HARASSMENT",
                    threshold="OFF"
                )],
                thinking_config=types.ThinkingConfig(
                    thinking_level="HIGH",
                ),
               response_mime_type="application/json",
               response_schema=response_schema
            )
        )
    except Exception as e:
        error_msg = f"Gemini API Error: Failed to generate content. This may be due to a timeout, connection issue, or an invalid response. Details: {str(e)}"
        print(error_msg)
        raise Exception(error_msg)
    
    # Cleanup remote files
    #if uploaded_file:
    #    try:
    #        client.files.delete(name=uploaded_file.name)
    #        print("Removed from Gemini storage.")
    #    except Exception as e:
    #        print(f"Failed to delete file from Gemini: {e}")
    #elif gcs_bucket and blob:
    #    try:
    #        blob.delete()
    #        print("Removed from GCS storage.")
    #    except Exception as e:
    #        print(f"Failed to delete file from GCS: {e}")
            
    # Parse results
    try:
         result_json = json.loads(response.text)
         return result_json
    except json.JSONDecodeError:
        print("Failed to decode JSON from Gemini response. Raw response:")
        print(response.text)
        return {"raw": response.text}
