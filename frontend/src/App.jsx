import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Settings, UploadCloud, Film, Play, X, CheckCircle2, Camera, Music, Activity, Lightbulb, PlayCircle, Sun, Moon, Share2, Scissors, Download } from 'lucide-react';
import './index.css';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_BASE_URL = 'http://localhost:8000/api';

function App() {
  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [uploadMode, setUploadMode] = useState('file');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [modelId, setModelId] = useState('gemini-3-pro-preview');
  const [gcsBucket, setGcsBucket] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [jobStage, setJobStage] = useState('initializing');
  const [jobMessage, setJobMessage] = useState('Preparing...');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [authMode, setAuthMode] = useState(null);
  const [availableModels, setAvailableModels] = useState([]);
  const [mouseEffect, setMouseEffect] = useState('particles');

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Fetch backend config on mount
  useEffect(() => {
    axios.get(`${API_BASE_URL}/config`)
      .then(res => {
        if (res.data.auth_mode) setAuthMode(res.data.auth_mode);
        if (res.data.default_model) setModelId(res.data.default_model);
        if (res.data.available_models) setAvailableModels(res.data.available_models);
      })
      .catch(err => console.error("Failed to fetch config", err));
  }, []);

  // Polling logic for job status
  useEffect(() => {
    let intervalId;
    if (isProcessing && jobId) {
      intervalId = setInterval(async () => {
        try {
          const res = await axios.get(`${API_BASE_URL}/status/${jobId}`);
          if (res.data) {
            setJobStage(res.data.stage);
            setJobMessage(res.data.message);
          }
        } catch (err) {
          console.error("Failed to poll status", err);
        }
      }, 2000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isProcessing, jobId]);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const trailRef = useRef([]);
  const frameRef = useRef(null);

  // Combined canvas effect — particles (float up), stardust (360° burst), comet (gradient trail)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || mouseEffect === 'off') {
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      cancelAnimationFrame(frameRef.current);
      particlesRef.current = [];
      trailRef.current = [];
      return;
    }

    const ctx = canvas.getContext('2d');
    const COLORS = ['rgba(94,92,230', 'rgba(10,132,255', 'rgba(48,209,88'];
    let colorIdx = 0;

    // Clear state from any previous effect
    particlesRef.current = [];
    trailRef.current = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMove = (e) => {
      if (mouseEffect === 'particles') {
        const color = COLORS[colorIdx++ % COLORS.length];
        for (let i = 0; i < 2; i++) {
          particlesRef.current.push({
            x: e.clientX + (Math.random() - 0.5) * 10,
            y: e.clientY + (Math.random() - 0.5) * 10,
            size: Math.random() * 8 + 4,
            opacity: 0.65,
            color,
            vy: -(Math.random() * 0.8 + 0.3),
            vx: (Math.random() - 0.5) * 0.8,
            decay: 0.016,
          });
        }
      } else if (mouseEffect === 'stardust') {
        const color = COLORS[colorIdx++ % COLORS.length];
        for (let i = 0; i < 6; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 3 + 1.5;
          particlesRef.current.push({
            x: e.clientX,
            y: e.clientY,
            size: Math.random() * 4 + 2,
            opacity: 0.85,
            color,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            decay: 0.04,
          });
        }
      } else if (mouseEffect === 'comet') {
        trailRef.current.push({ x: e.clientX, y: e.clientY, ts: Date.now() });
        if (trailRef.current.length > 80) trailRef.current.splice(0, trailRef.current.length - 80);
      }
      if (particlesRef.current.length > 200) particlesRef.current.splice(0, particlesRef.current.length - 200);
    };

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (mouseEffect === 'comet') {
        const now = Date.now();
        const FADE_MS = 600;
        trailRef.current = trailRef.current.filter(pt => now - pt.ts < FADE_MS);
        const len = trailRef.current.length;
        trailRef.current.forEach((pt, i) => {
          const age = (now - pt.ts) / FADE_MS;      // 0=fresh 1=expired
          const posInTrail = (i + 1) / len;          // 0=oldest 1=newest
          const opacity = (1 - age) * 0.82;
          const size = posInTrail * 10 + 1;
          let fillColor;
          if (posInTrail < 0.33)       fillColor = `rgba(94,92,230,${opacity})`;
          else if (posInTrail < 0.66)  fillColor = `rgba(10,132,255,${opacity})`;
          else                         fillColor = `rgba(48,209,88,${opacity})`;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, size, 0, Math.PI * 2);
          ctx.fillStyle = fillColor;
          ctx.fill();
        });
      } else {
        particlesRef.current = particlesRef.current.filter(p => p.opacity > 0.02);
        particlesRef.current.forEach(p => {
          p.opacity -= p.decay;
          p.size = Math.max(0, p.size * 0.975);
          p.y += p.vy;
          p.x += p.vx;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color},${p.opacity})`;
          ctx.fill();
        });
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove);
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frameRef.current);
      particlesRef.current = [];
      trailRef.current = [];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [mouseEffect]);

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
    if (uploadMode === 'file' && !file) return;
    if (uploadMode === 'url' && !youtubeUrl) return;

    setIsProcessing(true);
    setError(null);
    setResults(null);
    setJobStage('initializing');
    setJobMessage('Preparing...');

    const newJobId = Math.random().toString(36).substring(2, 15);
    setJobId(newJobId);

    const formData = new FormData();
    if (uploadMode === 'file') {
      formData.append('file', file);
    } else {
      formData.append('youtube_url', youtubeUrl);
    }
    formData.append('model_id', modelId);
    if (gcsBucket) formData.append('gcs_bucket', gcsBucket);
    formData.append('job_id', newJobId);

    try {
      const response = await axios.post(`${API_BASE_URL}/extract`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setJobStage('complete');
      setJobMessage('Extraction complete.');
      setResults(response.data.scenes);
    } catch (err) {
      let msg = 'Failed to process video.';
      if (err.response && err.response.data && err.response.data.detail) {
        msg = err.response.data.detail;
      }
      setError(msg);
      setJobStage('error');
    } finally {
      setIsProcessing(false);
      setJobId(null);
    }
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
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

  const getUploadClass = () => {
    if (['analyzing', 'qc', 'complete'].includes(jobStage)) return 'active completed';
    if (['initializing', 'uploading', 'uploading_gcs', 'uploading_gemini'].includes(jobStage)) return 'active processing';
    return '';
  };

  const getExtClass = () => {
    if (['qc', 'complete'].includes(jobStage)) return 'active completed';
    if (jobStage === 'analyzing' || (jobStage === 'initializing' && uploadMode === 'url')) return 'active processing';
    return '';
  };

  const getQcClass = () => {
    if (jobStage === 'complete') return 'active completed';
    if (jobStage === 'qc') return 'active processing';
    return '';
  };

  const getLineClass = (stageNum) => {
    if (stageNum === 1 && ['analyzing', 'qc', 'complete'].includes(jobStage)) return 'active';
    if (stageNum === 2 && ['qc', 'complete'].includes(jobStage)) return 'active';
    return '';
  };

  const downloadJSON = () => {
    if (!results) return;
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clipmagnet_results_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    if (!results) return;
    const doc = new jsPDF({ orientation: 'l', unit: 'mm', format: 'a4' });

    // Add Title
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.setFont('helvetica', 'bold');
    doc.text('ClipMagnet - Hook Scene Recommendations', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 26);

    const tableColumn = ["#", "Scene Title", "Category", "Timeline", "Description", "Action Plan"];
    const tableRows = [];

    results.forEach((scene, index) => {
      const actionPlanItems = [];
      if (scene.editing_justification) actionPlanItems.push(`• Why: ${scene.editing_justification}`);
      if (scene.visuals_camera) actionPlanItems.push(`• Visual: ${scene.visuals_camera}`);
      if (scene.audio_cues) actionPlanItems.push(`• Audio: ${scene.audio_cues}`);
      if (scene.pacing) actionPlanItems.push(`• Pacing: ${scene.pacing}`);
      if (scene.repurposing_idea) actionPlanItems.push(`• Repurpose: ${scene.repurposing_idea}`);
      if (scene.edit_cut_notes) actionPlanItems.push(`• Cut Notes: ${scene.edit_cut_notes}`);

      const actionPlanText = actionPlanItems.join('\n\n');

      tableRows.push([
        index + 1,
        scene.title || 'Untitled',
        scene.category || 'Uncategorized',
        `${scene.start_timestamp || scene.start} - ${scene.end_timestamp || scene.end}`,
        scene.description || scene.reason || '',
        actionPlanText
      ]);
    });

    autoTable(doc, {
      startY: 32,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3, overflow: 'linebreak', textColor: 40 },
      headStyles: { fillColor: [94, 92, 230], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 8, fontStyle: 'bold', halign: 'center' },
        1: { cellWidth: 40, fontStyle: 'bold' },
        2: { cellWidth: 28 },
        3: { cellWidth: 28, halign: 'center' },
        4: { cellWidth: 'auto' },
        5: { cellWidth: 'auto', fontSize: 8.5 }
      },
      margin: { left: 14, right: 14 },
      pageBreak: 'auto'
    });

    doc.save(`clipmagnet_results_${Date.now()}.pdf`);
  };

  return (
    <div className="app-container">
      {/* Background blob canvas */}
      <div className="bg-canvas" aria-hidden="true" />

      {/* Canvas: particles / stardust / comet */}
      <canvas ref={canvasRef} className="particle-canvas" aria-hidden="true" />

      {/* Floating Header */}
      <header className="app-header">
        <div className="logo-container">
          <div className="logo-icon">
            <Film size={18} />
          </div>
          <h1 className="app-title">ClipMagnet</h1>
        </div>
        <div className="header-actions">
          <button
            className="glass-button btn-icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button className="glass-button" onClick={() => setShowSettings(true)}>
            <Settings size={15} />
            <span>Config</span>
          </button>
        </div>
      </header>

      <main className="main-content">

        {/* ── Upload Section ── */}
        {!isProcessing && !results && (
          <div className="upload-container">

            {/* Hero copy */}
            <div className="upload-hero">
              <h2>Find Your Best Moments</h2>
              <p>Drop a video or paste a YouTube link — Gemini AI extracts every viral hook scene.</p>
            </div>

            {/* iOS Segmented Control */}
            <div className="upload-tabs">
              <div className="segmented-control">
                <button
                  className={`tab-btn ${uploadMode === 'file' ? 'active' : ''}`}
                  onClick={() => setUploadMode('file')}
                >
                  <UploadCloud size={13} />
                  Local File
                </button>
                <button
                  className={`tab-btn ${uploadMode === 'url' ? 'active' : ''}`}
                  onClick={() => setUploadMode('url')}
                >
                  <PlayCircle size={13} />
                  YouTube Link
                </button>
              </div>
            </div>

            {uploadMode === 'file' ? (
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
                  <UploadCloud size={32} />
                </div>
                <div className="upload-text">
                  <h3>Drop your video here</h3>
                  <p>or click to browse — MP4, MOV, AVI supported</p>
                </div>

                {file && (
                  <div className="file-selected-info">
                    <div className="file-name-badge">
                      <CheckCircle2 size={14} />
                      {file.name}&nbsp;·&nbsp;{(file.size / (1024 * 1024)).toFixed(1)} MB
                    </div>
                    <button
                      className="glass-button primary-button"
                      onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                    >
                      <Play size={15} />
                      Extract Hook Scenes
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-panel uploader-area" style={{ cursor: 'default' }}>
                <div className="upload-icon-wrapper">
                  <PlayCircle size={32} />
                </div>
                <div className="upload-text">
                  <h3>Paste a YouTube URL</h3>
                  <p>Gemini will analyze the public video directly</p>
                </div>
                <div className="url-input-group">
                  <input
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="custom-input"
                  />
                  <button
                    className="glass-button primary-button"
                    onClick={handleUpload}
                    disabled={!youtubeUrl}
                  >
                    <Play size={15} />
                    Extract Hook Scenes
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Processing State ── */}
        {isProcessing && (
          <div className="glass-panel status-container">
            <div>
              <p className="status-model-name">{modelId}</p>
              <h3 className="status-title">Analyzing Your Video</h3>
            </div>

            <div className="progress-tracker">
              {uploadMode === 'file' && (
                <>
                  <div className={`progress-step ${getUploadClass()}`}>
                    <div className="step-icon">
                      {getUploadClass().includes('completed') ? <CheckCircle2 size={22} /> : <UploadCloud size={22} />}
                    </div>
                    <div className="step-label">Uploading</div>
                  </div>
                  <div className={`progress-line ${getLineClass(1)}`} />
                </>
              )}

              <div className={`progress-step ${getExtClass()}`}>
                <div className="step-icon">
                  {getExtClass().includes('completed') ? <CheckCircle2 size={22} /> : <Film size={22} />}
                </div>
                <div className="step-label">AI Extraction</div>
              </div>

              <div className={`progress-line ${getLineClass(2)}`} />

              <div className={`progress-step ${getQcClass()}`}>
                <div className="step-icon">
                  {getQcClass().includes('completed') ? <CheckCircle2 size={22} /> : <Activity size={22} />}
                </div>
                <div className="step-label">Quality Check</div>
              </div>
            </div>

            <p className="status-message">{jobMessage}</p>
          </div>
        )}

        {/* ── Error State ── */}
        {error && (
          <div className="glass-panel error-panel">
            <h3 className="error-title">Something went wrong</h3>
            <p className="error-message">{error}</p>
            <button
              className="glass-button"
              style={{ marginTop: '16px' }}
              onClick={() => setError(null)}
            >
              Try Again
            </button>
          </div>
        )}

        {/* ── Results ── */}
        {results && (
          <div className="results-layout">

            {/* Sticky video panel */}
            <div className="video-sticky-container">
              {uploadMode === 'file' && videoUrl ? (
                <div className="video-wrapper">
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    className="video-element"
                    controls
                    playsInline
                  />
                </div>
              ) : uploadMode === 'url' && youtubeUrl && getYouTubeEmbedUrl(youtubeUrl) ? (
                <div className="video-wrapper" style={{ aspectRatio: '16/9' }}>
                  <iframe
                    width="100%"
                    height="100%"
                    src={getYouTubeEmbedUrl(youtubeUrl)}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    style={{ display: 'block' }}
                  />
                </div>
              ) : (
                <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Video preview not available.
                </div>
              )}

              <div className="results-actions">
                <span className="results-label">Review Extractions</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="glass-button"
                    style={{ fontSize: '13px', padding: '6px 12px', minHeight: '32px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    onClick={downloadJSON}
                    title="Download as JSON"
                  >
                    <Download size={13} />
                    JSON
                  </button>
                  <button
                    className="glass-button"
                    style={{ fontSize: '13px', padding: '6px 12px', minHeight: '32px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    onClick={downloadPDF}
                    title="Download as PDF"
                  >
                    <Download size={13} />
                    PDF
                  </button>
                  <button
                    className="glass-button primary-button"
                    style={{ fontSize: '13px', padding: '6px 14px', minHeight: '32px' }}
                    onClick={() => {
                      setResults(null);
                      setFile(null);
                      setVideoUrl(null);
                    }}
                  >
                    New Video
                  </button>
                </div>
              </div>
            </div>

            {/* Scene list */}
            <div className="timeline-container">
              <div className="timeline-header">
                <Film size={20} />
                <span>Hook Scenes</span>
                {Array.isArray(results) && (
                  <span className="scene-count-badge">{results.length}</span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Array.isArray(results) ? results.map((scene, idx) => (
                  <div
                    key={idx}
                    className={`glass-panel scene-card ${getCategoryTheme(scene.category)}`}
                    style={{ animationDelay: `${idx * 55}ms` }}
                  >
                    <div className="scene-header-row">
                      <div className="scene-title-group">
                        <div className="scene-category">{scene.category}</div>
                        <div className="scene-title">{scene.title}</div>
                      </div>
                      <div
                        className="scene-time-badge"
                        title="Click to seek to this scene"
                        onClick={() => seekToTime(scene.start_timestamp || scene.start)}
                      >
                        <PlayCircle size={13} />
                        {scene.start_timestamp || scene.start} – {scene.end_timestamp || scene.end}
                      </div>
                    </div>

                    <div className="scene-desc">
                      {scene.description || scene.reason || 'Hook explanation'}
                    </div>

                    {(scene.editing_justification || scene.visuals_camera || scene.audio_cues || scene.pacing || scene.repurposing_idea || scene.edit_cut_notes || scene.qc_reasoning) && (
                      <div className="metadata-grid">
                        {scene.repurposing_idea && (
                          <div className="metadata-item">
                            <div className="metadata-icon"><Share2 size={15} /></div>
                            <div className="metadata-content">
                              <span className="metadata-label">Repurpose</span>
                              <span className="metadata-value">{scene.repurposing_idea}</span>
                            </div>
                          </div>
                        )}
                        {scene.edit_cut_notes && (
                          <div className="metadata-item">
                            <div className="metadata-icon"><Scissors size={15} /></div>
                            <div className="metadata-content">
                              <span className="metadata-label">Cut Notes</span>
                              <span className="metadata-value">{scene.edit_cut_notes}</span>
                            </div>
                          </div>
                        )}
                        {scene.editing_justification && (
                          <div className="metadata-item">
                            <div className="metadata-icon"><Lightbulb size={15} /></div>
                            <div className="metadata-content">
                              <span className="metadata-label">Why it works</span>
                              <span className="metadata-value">{scene.editing_justification}</span>
                            </div>
                          </div>
                        )}
                        {scene.visuals_camera && (
                          <div className="metadata-item">
                            <div className="metadata-icon"><Camera size={15} /></div>
                            <div className="metadata-content">
                              <span className="metadata-label">Camera & Visuals</span>
                              <span className="metadata-value">{scene.visuals_camera}</span>
                            </div>
                          </div>
                        )}
                        {scene.audio_cues && (
                          <div className="metadata-item">
                            <div className="metadata-icon"><Music size={15} /></div>
                            <div className="metadata-content">
                              <span className="metadata-label">Audio Cues</span>
                              <span className="metadata-value">{scene.audio_cues}</span>
                            </div>
                          </div>
                        )}
                        {scene.pacing && (
                          <div className="metadata-item">
                            <div className="metadata-icon"><Activity size={15} /></div>
                            <div className="metadata-content">
                              <span className="metadata-label">Pacing / Energy</span>
                              <span className="metadata-value">{scene.pacing}</span>
                            </div>
                          </div>
                        )}
                        {scene.qc_reasoning && (
                          <div className="metadata-item qc-item">
                            <div className="metadata-icon"><CheckCircle2 size={15} /></div>
                            <div className="metadata-content">
                              <span className="metadata-label">QC Validation</span>
                              <span className="metadata-value">{scene.qc_reasoning}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )) : (
                  <pre className="json-fallback">
                    {JSON.stringify(results, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Config Modal ── */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="glass-panel modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">
                Configuration
                {authMode && (
                  <span className={`auth-mode-badge ${authMode === 'vertex_ai' ? 'vertex' : 'developer'}`}>
                    {authMode === 'vertex_ai' ? 'Vertex AI' : 'Developer API'}
                  </span>
                )}
              </span>
              <button
                className="glass-button btn-icon"
                onClick={() => setShowSettings(false)}
                aria-label="Close settings"
              >
                <X size={18} />
              </button>
            </div>

            <div className="form-group">
              <label htmlFor="model-select">Gemini Model</label>
              <select
                id="model-select"
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
              >
                {availableModels.length > 0
                  ? availableModels.map(m => <option key={m} value={m}>{m}</option>)
                  : <option value={modelId}>{modelId}</option>
                }
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="gcs-bucket">
                GCS Bucket <span style={{ fontWeight: 400, opacity: 0.6 }}>(Optional)</span>
              </label>
              <input
                id="gcs-bucket"
                type="text"
                value={gcsBucket}
                onChange={(e) => setGcsBucket(e.target.value)}
                placeholder="e.g. my-video-bucket"
                className="custom-input"
              />
            </div>

            <p className="auth-help-text">
              {authMode === 'vertex_ai'
                ? 'Running in Vertex AI mode. Authenticate with: gcloud auth application-default login. Set a GCS bucket for files larger than ~100 MB.'
                : authMode === 'developer_api'
                ? 'Running in Gemini Developer API mode. Files are uploaded via the Gemini Files API. GCS bucket is optional.'
                : 'Loading configuration…'}
            </p>
          </div>
        </div>
      )}

      {/* ── FX Toggle ── */}
      <div className="fx-toggle" role="group" aria-label="Mouse effect">
        <span className="fx-label">FX</span>
        <button
          className={`fx-btn ${mouseEffect === 'particles' ? 'active' : ''}`}
          onClick={() => setMouseEffect(mouseEffect === 'particles' ? 'off' : 'particles')}
          title="Particles — colored orbs float upward"
        >
          Particles
        </button>
        <button
          className={`fx-btn ${mouseEffect === 'stardust' ? 'active' : ''}`}
          onClick={() => setMouseEffect(mouseEffect === 'stardust' ? 'off' : 'stardust')}
          title="Stardust — 360° burst scatter on every move"
        >
          Stardust
        </button>
        <button
          className={`fx-btn ${mouseEffect === 'comet' ? 'active' : ''}`}
          onClick={() => setMouseEffect(mouseEffect === 'comet' ? 'off' : 'comet')}
          title="Comet — gradient trail fades behind cursor"
        >
          Comet
        </button>
      </div>

      {/* ── Footer ── */}
      <footer className="app-footer">
        <span>
          By{' '}
          <a href="https://www.linkedin.com/in/sunilkumar88/" target="_blank" rel="noopener noreferrer" className="footer-link">Sunil Kumar</a>
          {' '}&bull;{' '}
          <a href="https://www.linkedin.com/in/lavinigam/" target="_blank" rel="noopener noreferrer" className="footer-link">Lavi Nigam</a>
        </span>
      </footer>
    </div>
  );
}

export default App;