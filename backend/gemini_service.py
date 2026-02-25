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

async def process_video(video_path: str, mime_type: str, model_id: str, gcs_bucket: str = None, youtube_url: str = None):
    """
    Upload the video to Gemini or GCS (or process YouTube URL directly) and prompt for hook scene extraction.
    """
    client = get_client()
    uploaded_file = None
    blob = None
    
    if youtube_url:
        print(f"Using YouTube URI directly: {youtube_url}")
        video_part = types.Part.from_uri(file_uri=youtube_url, mime_type=mime_type)
    elif gcs_bucket and video_path:
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
    - Any other category that you think is a hook or key scene for retention specific for platform like youtube, instagram, tiktok, etc.


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
    *   **Repurposing Idea:** [Where this clip belongs—e.g., YouTube Shorts, Video Intro Teaser, B-roll overlay, Instagram Reels, TikTok]
    *   **Edit/Cut Notes:** [Instructions on what to remove (e.g., dead air, filler words), what music/SFX to add, and how the clip should start/end (e.g., seamless loop, hard cut).]

    ### 3. STRICT PROCESSING CONSTRAINTS (CRITICAL)
    1. Segment your mental processing and planning. Evaluate the video chronologically to ensure you do not miss hidden hooks in the middle or end of the video.
    2. Ensure highly precise timestamps and revalidate it before sending it to the user as final response.
    3. Print the text `[END OF VIDEO REACHED: MM:SS]` at the very bottom of your response to confirm you have successfully analyzed the file to the final second.

    Begin your chronological analysis now. Unmistakably, make sure to recheck the response and its timestamps alignment with video before sending it to the user as final response.
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
                "repurposing_idea": {"type": "STRING", "description": "Where this clip belongs—e.g., YouTube Shorts, Video Intro Teaser, B-roll overlay, Instagram Reels, TikTok"},
                "edit_cut_notes": {"type": "STRING", "description": "Instructions on what to remove (e.g., dead air, filler words), what music/SFX to add, and how the clip should start/end (e.g., seamless loop, hard cut)."},
            },
            "required": ["title", "start_timestamp", "end_timestamp", "category", "description", "editing_justification", "visuals_camera", "audio_cues", "pacing", "repurposing_idea", "edit_cut_notes"]
        }
    }
    
    # Define a strict JSON schema for the QC output
    qc_response_schema = {
        "type": "ARRAY",
        "description": "A list of quality-checked and corrected hook scenes.",
        "items": {
            "type": "OBJECT",
            "properties": {
                "title": {"type": "STRING"},
                "start_timestamp": {"type": "STRING", "description": "MM:SS format e.g., 01:23. Corrected if necessary."},
                "end_timestamp": {"type": "STRING", "description": "MM:SS format e.g., 01:45. Corrected if necessary."},
                "category": {"type": "STRING"},
                "description": {"type": "STRING", "description": "Corrected description if necessary."},
                "editing_justification": {"type": "STRING"},
                "visuals_camera": {"type": "STRING"},
                "audio_cues": {"type": "STRING"},
                "pacing": {"type": "STRING"},
                "repurposing_idea": {"type": "STRING"},
                "edit_cut_notes": {"type": "STRING"},
                "qc_reasoning": {"type": "STRING", "description": "Explanation of any corrections made (e.g. fixed timestamp discrepancy) or confirmation that the scene is accurate."},
            },
            "required": ["title", "start_timestamp", "end_timestamp", "category", "description", "editing_justification", "visuals_camera", "audio_cues", "pacing", "repurposing_idea", "edit_cut_notes", "qc_reasoning"]
        }
    }
    
    print(f"Prompting the model ({model_id}) with the video (Stage 1: Extraction)...")
    
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
                media_resolution=types.MediaResolution.MEDIA_RESOLUTION_HIGH,
                audio_timestamp=True,
                response_mime_type="application/json",
                response_schema=response_schema
            )
        )
    except Exception as e:
        error_msg = f"Gemini API Error: Failed to generate content. This may be due to a timeout, connection issue, or an invalid response. Details: {str(e)}"
        print(error_msg)
        raise Exception(error_msg)
            
    # Phase 1: Extract JSON strings from response
    stage_1_json_text = response.text
    
    # Phase 2: QC Pass
    print(f"Starting Stage 2: Quality Check with model ({model_id})...")
    qc_prompt = f"""
    Act as a strict Quality Control Editor. You will be provided with the exact video file and the draft list of extracted hook scenes generated in the previous step (provided below as JSON).
    
    Your job is to RE-WATCH the given video and VERIFY every single scene in the draft JSON.
    
    ### STRICT INSTRUCTIONS:
    1. DO NOT INVENT NEW SCENES. You must only validate the scenes provided in the draft json.
    2. CHECK TIMESTAMPS: Compare the start/end timestamps from the draft with the actual video. If they are slightly off or wildly incorrect, UPDATE them in your final output.
    3. CHECK HALLUCINATIONS: Ensure the description, dialogue, and visuals actually happen in the video. If the draft halluncinated a detail, FIX the description.
    4. ADD QC REASONING: For every scene, populate the new `qc_reasoning` field. State clearly if you modified the scene (e.g., "Corrected start time from 01:10 to 01:12 to match dialogue start") or if it was accurate (e.g., "Timestamp and description verified as accurate").
    
    ### DRAFT SCENES JSON:
    {stage_1_json_text}
    
    Output the final, corrected JSON array containing ALL scenes from the draft, updated as necessary, matching the requested schema exactly.
    """
    
    try:
        qc_response = client.models.generate_content(
            model=model_id,
            contents=[video_part, qc_prompt],
            config=types.GenerateContentConfig(
               temperature = 0.5, # Lower temperature for QC to be more deterministic
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
                media_resolution=types.MediaResolution.MEDIA_RESOLUTION_HIGH,
                audio_timestamp=True,
                response_mime_type="application/json",
                response_schema=qc_response_schema
            )
        )
    except Exception as e:
         error_msg = f"Gemini API Error (Stage 2 QC): {str(e)}"
         print(error_msg)
         raise Exception(error_msg)

            
    # Parse results
    try:
         result_json = json.loads(qc_response.text)
         return result_json
    except json.JSONDecodeError:
        print("Failed to decode JSON from Gemini response. Raw response:")
        print(qc_response.text) # Changed to qc_response.text
        return {"raw": qc_response.text} # Changed to qc_response.text
