# AI-PROOF Developer Guide

## Project Overview

AI-PROOF is a full-stack application for detecting AI-generated images using StegaStamp invisible watermarks. It consists of:

- **Backend**: FastAPI server with TensorFlow-based watermark embedding/detection
- **Frontend**: Next.js application with interactive image processing UI
- **Infrastructure**: Docker containers and Docker Compose orchestration

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (Next.js 15)                 │
│  Landing → Generate → Detect → Pipeline                │
│  (React + Tailwind + Framer Motion)                     │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ HTTP/REST
                       │ (CORS Enabled)
                       ▼
┌─────────────────────────────────────────────────────────┐
│           Backend (FastAPI)                             │
│  /api/stamp (POST)                                      │
│  /api/detect (POST)                                     │
│  /api/health (GET)                                      │
│  /docs (Swagger UI)                                     │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ TensorFlow Session
                       │
                       ▼
        ┌──────────────────────────────┐
        │  StegaStamp Model            │
        │  - Encoder (Watermark)       │
        │  - Decoder (Detection)       │
        │  - FFT Analysis              │
        └──────────────────────────────┘
```

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- Git
- Docker (optional)

### Quick Setup

```bash
# Clone/navigate to project
cd ai-proof

# Backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --reload

# Frontend (new terminal)
cd frontend
npm install
npm run dev

# Access
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/docs
```

## Project Structure Deep Dive

### Backend (`backend/`)

#### `app/main.py`
The FastAPI application entry point.

**Key components**:
- `FastAPI()` - App initialization
- `CORSMiddleware` - Cross-origin support
- `@app.post("/api/stamp")` - Watermark embedding endpoint
- `@app.post("/api/detect")` - Watermark detection endpoint
- `@app.get("/api/health")` - Health check

**Data Flow**:
1. Client uploads file via multipart/form-data
2. File saved to temporary location
3. StegaStamp wrapper processes image
4. Result returned as JSON with base64 data
5. Temporary file cleaned up

#### `app/stegastamp.py`
Wrapper for TensorFlow StegaStamp model.

**Classes**:
- `StegaStampWrapper` - Main class managing model lifecycle

**Methods**:
- `__init__()` - Load TensorFlow model
- `encode_image()` - Embed watermark
- `decode_image()` - Extract watermark
- `_apply_simple_watermark()` - Fallback watermarking
- `_detect_watermark_simple()` - Fallback detection
- `_generate_frequency_heatmap()` - FFT visualization

**Key Features**:
- TensorFlow 1.15 session management
- Graceful fallback for development
- Base64 encoding/decoding
- Frequency domain analysis
- Error handling

#### `app/config.py`
Configuration management via environment variables.

**Configuration Options**:
- `STEGASTAMP_MODEL_PATH` - Model directory
- `WATERMARK_SECRET` - Watermark payload
- `API_HOST` / `API_PORT` - Server binding
- `MAX_IMAGE_SIZE` - Upload size limit
- `ALLOWED_EXTENSIONS` - Supported formats

### Frontend (`frontend/`)

#### Pages Structure

**`app/page.tsx`** - Landing Page
- Hero section with animated gradient text
- Three CTA buttons linking to main features
- Feature cards explaining capabilities
- Responsive design with mobile-first approach

**`app/generate/page.tsx`** - Stamping Page
- Drag-drop upload zone
- Progress indicators
- Side-by-side before/after preview
- Download watermarked image button
- Error handling with user feedback

**`app/detect/page.tsx`** - Detection Page
- Image upload with preview
- Confidence score visualization (0-100%)
- Frequency domain heatmap display
- Detection badge (AI-Generated or Authentic)
- Statistics cards

**`app/pipeline/page.tsx`** - Attack Testing Page
- 6 attack simulation cards
- Survival rate bars (%)
- Overall resilience metrics
- Interactive detail modal
- Risk level classification

#### Styling System

**`globals.css`** - Global styles with custom classes:
- `.button-primary` / `.button-secondary` - Button styles
- `.card-glass` - Glassmorphism cards
- `.drag-drop-zone` - Upload area
- `.gradient-text` - Gradient text effect
- Animations: `float`, `shimmer`

**Tailwind Configuration** (`tailwind.config.js`):
- Custom color palette (slate grays)
- Custom animations
- Responsive breakpoints
- Dark theme setup

#### Component Patterns

**File Upload Pattern**:
```typescript
const [file, setFile] = useState<File | null>(null);
const [dragActive, setDragActive] = useState(false);

const handleDrag = (e: React.DragEvent) => {
  e.preventDefault();
  setDragActive(e.type !== 'dragleave');
};

const handleDrop = (e: React.DragEvent) => {
  e.preventDefault();
  setDragActive(false);
  const files = e.dataTransfer.files;
  if (files) processFile(files[0]);
};
```

**API Integration Pattern**:
```typescript
const response = await fetch('http://localhost:8000/api/stamp', {
  method: 'POST',
  body: formData,
});
const data = await response.json();
```

**Animation Pattern** (Framer Motion):
```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2 }}
>
  Content
</motion.div>
```

### Docker Configuration

**`Dockerfile`** - Backend Container
- Base: `python:3.10-slim`
- Installs system dependencies
- Installs Python packages
- Copies backend code
- Exposes port 8000
- Health check enabled

**`docker-compose.yml`** - Multi-container Setup
- Backend service with health check
- Frontend service with npm dev
- Volume mounts for development
- Network isolation
- Service dependencies

## Common Development Tasks

### Adding a New API Endpoint

1. Define function in `backend/app/main.py`:
```python
@app.post("/api/new-endpoint")
async def new_endpoint(file: UploadFile = File(...)):
    # Implementation
    return JSONResponse({"result": "success"})
```

2. Update frontend API call:
```typescript
const response = await fetch('http://localhost:8000/api/new-endpoint', {
  method: 'POST',
  body: formData,
});
```

### Adding a New Frontend Page

1. Create page structure:
```bash
mkdir -p frontend/app/new-page
touch frontend/app/new-page/page.tsx
touch frontend/app/new-page/layout.tsx
```

2. Implement `page.tsx`:
```typescript
'use client';
export default function NewPage() {
  return <main>Content</main>;
}
```

3. Update `layout.tsx` with metadata

### Modifying Styling

- Global styles: Edit `frontend/app/globals.css`
- Tailwind config: Edit `frontend/tailwind.config.js`
- Component styles: Use Tailwind classes in JSX
- Animations: Define in globals.css or Tailwind

### Debugging

**Backend Debug**:
```bash
# Enable verbose logging
import logging
logging.basicConfig(level=logging.DEBUG)

# Or use debugger
import pdb; pdb.set_trace()
```

**Frontend Debug**:
```typescript
// Console logging
console.log('Debug:', variable);

// Browser DevTools (F12)
// Network tab for API calls
// Elements tab for DOM inspection
// Console for JS errors
```

## Performance Optimization

### Backend
- **Model Caching**: Load model once, reuse session
- **File Handling**: Stream large files
- **Error Handling**: Fail fast, cleanup resources
- **Dependencies**: Use lightweight packages

### Frontend
- **Code Splitting**: Next.js automatic splitting
- **Image Optimization**: Next.js Image component ready
- **CSS**: Tailwind purges unused styles
- **Animations**: Framer Motion is performant

## Testing

### Manual Testing

**Backend**:
```bash
# Health check
curl http://localhost:8000/api/health

# Test endpoint
curl -X POST -F "file=@test.jpg" http://localhost:8000/api/stamp
```

**Frontend**:
1. Open http://localhost:3000
2. Upload test images
3. Verify responses display correctly
4. Test all pages

### Automated Testing

Add pytest for backend:
```bash
pip install pytest pytest-asyncio
# Create tests/test_*.py
pytest
```

## Deployment

### Docker Deployment

```bash
# Build
docker build -t ai-proof-backend .

# Run
docker run -p 8000:8000 ai-proof-backend

# Or with compose
docker-compose up --build
```

### Environment Setup

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` with production values

## Common Issues & Solutions

### Issue: "Connection refused" on localhost:8000
**Solution**: 
- Ensure backend is running
- Check port 8000 is not in use
- Verify firewall allows port

### Issue: Model loading fails
**Solution**:
- Check model path in config
- System falls back to simulation mode
- Errors are non-fatal

### Issue: CORS errors in frontend
**Solution**:
- CORS is enabled by default
- Check API URL in frontend config
- Clear browser cache

### Issue: Docker build fails
**Solution**:
- Check Docker daemon is running
- Ensure sufficient disk space
- Review error messages carefully

## Code Style

### Python (Backend)
- PEP 8 style guide
- Type hints for functions
- Docstrings for classes/functions
- 88 character line limit (Black formatter)

### TypeScript/React (Frontend)
- ESLint configuration (if added)
- Prettier formatting (recommended)
- Functional components with hooks
- Props interface declarations

## Dependencies

### Backend
- fastapi - Web framework
- uvicorn - ASGI server
- tensorflow - ML framework
- opencv-python - Image processing
- pillow - Image manipulation

### Frontend
- next - React framework
- react / react-dom - UI
- framer-motion - Animations
- tailwindcss - Styling

## Resources

### Documentation
- Backend: README.md, SETUP.md
- Frontend: Built-in Next.js docs
- API: http://localhost:8000/docs

### External
- FastAPI: https://fastapi.tiangolo.com/
- Next.js: https://nextjs.org/docs
- TensorFlow 1.15: https://www.tensorflow.org/api_docs/python/tf
- Tailwind CSS: https://tailwindcss.com/docs

## Contributing

1. Create a feature branch
2. Make changes
3. Test thoroughly
4. Commit with clear messages
5. Push and create PR

## License

MIT License - See LICENSE file

---

**Questions?** Check README.md, SETUP.md, or QUICKSTART.md for more information.
