# UI Redesign Plan — Apple Glass / iOS Theme

## Status: ✅ COMPLETE — ready for local testing

---

## What Was Done

### 1. `frontend/src/index.css` — Full Rewrite ✅
Complete Apple design system:
- **Design tokens**: `data-theme="dark"` and `data-theme="light"` CSS custom properties
- **Dark theme**: `#000000` base (OLED black), `rgba(28,28,30,0.72)` glass, `#0A84FF` accent, `#30D158` success
- **Light theme**: `#F2F2F7` base (Apple System Background), `rgba(255,255,255,0.78)` glass, `#007AFF` accent, `#34C759` success
- **Font**: Plus Jakarta Sans from Google Fonts (SaaS-friendly Apple aesthetic)
- **Background blobs**: CSS radial gradients on `::before` pseudo-element with `blobDrift` keyframe
- **Glass effect**: `backdrop-filter: blur(24px) saturate(180%)` — `saturate(180%)` is the key to authentic frosted glass
- **iOS Segmented Control**: `.segmented-control` + `.tab-btn` + `.tab-btn.active` pill
- **Floating sticky header**: `position: sticky; top: 16px; border-radius: var(--radius-xl)`
- **Staggered card animations**: `@keyframes cardIn` with `animationDelay` per card
- **Scene count badge**: `.scene-count-badge`
- **Auth mode badges**: `.auth-mode-badge.vertex`, `.auth-mode-badge.developer`
- **QC item tile**: `.metadata-item.qc-item` with success color
- **JSON fallback**: `.json-fallback` (monospace, glass background)
- **Mobile responsive**: breakpoint at 640px
- **`prefers-reduced-motion`**: all animations disabled

### 2. `frontend/src/App.jsx` — Full Rewrite ✅
All React logic preserved identically. Only JSX structure/classNames updated:
- `<div className="bg-canvas" aria-hidden="true" />` — animated background
- Header: `.header-actions`, `.btn-icon` for icon-only buttons
- Upload hero section: `.upload-hero` with tagline
- iOS segmented control tabs
- File selection: `.file-selected-info`, `.file-name-badge`
- Processing: `.status-model-name`, `.status-title`
- Progress: self-closing `<div className=... />` for progress lines
- Error: `.error-panel`, `.error-title`, `.error-message`
- Results: `.results-actions`, `.results-label`, `.scene-count-badge`
- Scene cards: `animationDelay` stagger
- Metadata: all 6 fields + QC item with `.qc-item`
- Config modal: `.modal-title`, `.auth-mode-badge`, `.auth-help-text`, dynamic model dropdown from `availableModels` state

---

## Tokens Overflow Strategy

When implementing large files in Claude Code:
1. **Use `Edit` not `Write`** for all completions — Edit only sends diffs
2. **Break large writes into sections** (top third → middle → bottom)
3. **Save plans to `.docs/`** before starting implementation
4. After any `/compact`, re-read the plan file to restore context

---

## How to Test

```bash
# From the worktree root:
make run
# Frontend: http://localhost:5173
# Backend:  http://localhost:8000
```

Test checklist:
- [ ] Dark/Light theme toggle
- [ ] File upload drag-and-drop
- [ ] YouTube URL input
- [ ] Processing progress steps animate correctly
- [ ] Scene cards appear with staggered animation
- [ ] Metadata tiles render (repurpose, cut notes, why it works, camera, audio, pacing)
- [ ] QC Validation tile renders in green
- [ ] Timestamp badge seeks video on click
- [ ] Config modal shows auth mode badge
- [ ] Config modal shows dynamic model list
- [ ] Mobile layout (< 640px) looks correct

---

## Commit (after testing passes)

```bash
cd .worktrees/feature/multi-auth-upload
git add frontend/src/App.jsx frontend/src/index.css
git commit -m "feat: Apple glass UI redesign with iOS/macOS theme"
```
