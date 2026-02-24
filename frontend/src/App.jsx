import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Settings, UploadCloud, Film, Play, X, CheckCircle2, Camera, Music, Activity, Lightbulb, PlayCircle, Sun, Moon } from 'lucide-react';
import './index.css';

const API_BASE_URL = 'http://localhost:8000/api';

function App() {
  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [modelId, setModelId] = useState('gemini-3-pro-preview');
  const [gcsBucket, setGcsBucket] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState('dark');

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('dragging');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragging');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragging');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selected = e.dataTransfer.files[0];
      setFile(selected);
      setVideoUrl(URL.createObjectURL(selected));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      setFile(selected);
      setVideoUrl(URL.createObjectURL(selected));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setResults(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('model_id', modelId);
    if (gcsBucket) formData.append('gcs_bucket', gcsBucket);

    try {
      const response = await axios.post(`${API_BASE_URL}/extract`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResults(response.data.scenes);
    } catch (err) {
      let msg = 'Failed to process video.';
      if (err.response && err.response.data && err.response.data.detail) {
        msg = err.response.data.detail;
      }
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const getCategoryTheme = (catStr) => {
    const cat = (catStr || '').toLowerCase();
    if (cat.includes('comedy')) return 'cat-comedy';
    if (cat.includes('suspense') || cat.includes('thrill')) return 'cat-suspense';
    if (cat.includes('emotion') || cat.includes('drama')) return 'cat-emotion';
    if (cat.includes('action')) return 'cat-action';
    if (cat.includes('info')) return 'cat-info';
    return '';
  };

  const seekToTime = (timeStr) => {
    if (!videoRef.current || !timeStr) return;

    // Parse time string e.g. "00:01:23"
    try {
      const parts = timeStr.split(':').reverse();
      let seconds = 0;
      for (let i = 0; i < parts.length; i++) {
        seconds += parseInt(parts[i]) * Math.pow(60, i);
      }
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
    } catch (err) {
      console.error("Failed to parse time:", timeStr);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-container">
          <div className="logo-icon">
            <Film size={24} />
          </div>
          <h1 className="app-title">ClipMagnet</h1>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="glass-button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Toggle Theme"
            style={{ padding: '10px' }}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="glass-button" onClick={() => setShowSettings(true)}>
            <Settings size={18} />
            <span>Config</span>
          </button>
        </div>
      </header>

      <main className="main-content">
        {!isProcessing && !results && (
          <div
            className="glass-panel uploader-area"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileInput}
          >
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="video/*"
              onChange={handleFileChange}
            />
            <div className="upload-icon-wrapper">
              <UploadCloud size={40} />
            </div>
            <div className="upload-text">
              <h3>Upload Video</h3>
              <p>Drag and drop a video file here, or click to browse</p>
            </div>

            {file && (
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div style={{ color: '#4285f4', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={18} />
                  {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </div>
                <button
                  className="glass-button primary-button"
                  onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                >
                  <Play size={18} /> Extract Hook Scenes
                </button>
              </div>
            )}
          </div>
        )}

        {isProcessing && (
          <div className="glass-panel status-container">
            <div className="spinner"></div>
            <h3>Processing with {modelId}...</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Gemini is analyzing the video to extract key moments. This may take a few minutes for larger files.</p>
          </div>
        )}

        {error && (
          <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid #ea4335' }}>
            <h3 style={{ color: '#ea4335', marginBottom: '8px' }}>Error</h3>
            <p>{error}</p>
            <button className="glass-button" style={{ marginTop: '16px' }} onClick={() => setError(null)}>Try Again</button>
          </div>
        )}

        {results && (
          <div className="results-layout">
            <div className="video-sticky-container">
              {videoUrl ? (
                <div className="video-wrapper">
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    className="video-element"
                    controls
                    playsInline
                  />
                </div>
              ) : (
                <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
                  Video preview not available.
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>Review Extractions</h3>
                <button
                  className="glass-button"
                  style={{ fontSize: '13px', padding: '6px 12px' }}
                  onClick={() => {
                    setResults(null);
                    setFile(null);
                    setVideoUrl(null);
                  }}
                >
                  Upload New Video
                </button>
              </div>
            </div>

            <div className="timeline-container">
              <div className="timeline-header">
                <Film size={24} />
                <span>Extracted Hook Scenes</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {Array.isArray(results) ? results.map((scene, idx) => (
                  <div key={idx} className={`glass-panel scene-card ${getCategoryTheme(scene.category)}`}>

                    <div className="scene-header-row">
                      <div className="scene-title-group">
                        <div className="scene-category">{scene.category}</div>
                        <div className="scene-title">{scene.title}</div>
                      </div>
                      <div
                        className="scene-time-badge"
                        title="Click to seek to this scene in the video"
                        onClick={() => seekToTime(scene.start_timestamp || scene.start)}
                      >
                        <PlayCircle size={16} />
                        {scene.start_timestamp || scene.start} - {scene.end_timestamp || scene.end}
                      </div>
                    </div>

                    <div className="scene-content">
                      <div className="scene-desc">
                        {scene.description || scene.reason || "Hook explanation"}
                      </div>

                      {/* Render Editor Metadata in a nice grid */}
                      {(scene.editing_justification || scene.visuals_camera || scene.audio_cues || scene.pacing) && (
                        <div className="metadata-grid">
                          {scene.editing_justification && (
                            <div className="metadata-item">
                              <div className="metadata-icon"><Lightbulb size={20} /></div>
                              <div className="metadata-content">
                                <span className="metadata-label">Why it works</span>
                                <span className="metadata-value">{scene.editing_justification}</span>
                              </div>
                            </div>
                          )}
                          {scene.visuals_camera && (
                            <div className="metadata-item">
                              <div className="metadata-icon"><Camera size={20} /></div>
                              <div className="metadata-content">
                                <span className="metadata-label">Camera & Visuals</span>
                                <span className="metadata-value">{scene.visuals_camera}</span>
                              </div>
                            </div>
                          )}
                          {scene.audio_cues && (
                            <div className="metadata-item">
                              <div className="metadata-icon"><Music size={20} /></div>
                              <div className="metadata-content">
                                <span className="metadata-label">Audio Notes</span>
                                <span className="metadata-value">{scene.audio_cues}</span>
                              </div>
                            </div>
                          )}
                          {scene.pacing && (
                            <div className="metadata-item">
                              <div className="metadata-icon"><Activity size={20} /></div>
                              <div className="metadata-content">
                                <span className="metadata-label">Pacing / Energy</span>
                                <span className="metadata-value">{scene.pacing}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )) : (
                  <pre style={{ background: 'rgba(0,0,0,0.5)', padding: '20px', borderRadius: '8px', overflowX: 'auto' }}>
                    {JSON.stringify(results, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="glass-panel modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span>Configuration</span>
              <button className="close-btn" onClick={() => setShowSettings(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="form-group">
              <label>Gemini Model</label>
              <select value={modelId} onChange={(e) => setModelId(e.target.value)}>
                <option value="gemini-3-pro-preview">gemini-3-pro-preview</option>
                <option value="gemini-3-flash-preview">gemini-3-flash-preview</option>
                <option value="gemini-2.5-pro">gemini-2.5-pro</option>
                <option value="gemini-2.0-flash-exp">gemini-2.0-flash-exp</option>
              </select>
            </div>
            <div className="form-group">
              <label>GCS Bucket (Optional)</label>
              <input
                type="text"
                value={gcsBucket}
                onChange={(e) => setGcsBucket(e.target.value)}
                placeholder="e.g. my-video-bucket"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'var(--transition)'
                }}
              />
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              This model will be used by Vertex AI for inference. Ensure your environment has the correct Google Cloud credentials.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
