# AI-PROOF Quick Reference Guide

## 🚀 Getting Started (5 minutes)

### Option 1: Docker (Recommended)
```bash
# Build and run backend
docker build -t ai-proof-backend .
docker run -p 8000:8000 ai-proof-backend

# In another terminal, run frontend
cd frontend && npm install && npm run dev

# Open browser
http://localhost:3000
```

### Option 2: Docker Compose (Full Stack)
```bash
docker-compose up --build
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/docs
```

### Option 3: Local Development
```bash
# Terminal 1: Backend
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --reload

# Terminal 2: Frontend
cd frontend && npm install && npm run dev
```

## 📖 API Reference

### Generate Watermark
```bash
curl -X POST -F "file=@image.jpg" http://localhost:8000/api/stamp
```
Returns: Base64 PNG with embedded watermark

### Detect Watermark
```bash
curl -X POST -F "file=@image.jpg" http://localhost:8000/api/detect
```
Returns: Detection status, confidence (0-1), heatmap

### Check Health
```bash
curl http://localhost:8000/api/health
```
Returns: Service status

## 🎨 Frontend Pages

| URL | Purpose |
|-----|---------|
| `/` | Landing page with feature overview |
| `/generate` | Upload and embed watermark |
| `/detect` | Upload to detect AI watermarks |
| `/pipeline` | Test watermark against attacks |

## 📁 Project Structure

```
ai-proof/
├── backend/app/
│   ├── main.py              # FastAPI endpoints
│   ├── stegastamp.py        # Watermark encoder/decoder
│   ├── config.py            # Configuration
│   └── models/              # TensorFlow model
├── frontend/app/
│   ├── page.tsx             # Landing page
│   ├── generate/page.tsx    # Stamping page
│   ├── detect/page.tsx      # Detection page
│   ├── pipeline/page.tsx    # Attack testing
│   └── globals.css          # Styles
├── Dockerfile               # Backend container
├── docker-compose.yml       # Full stack
├── README.md                # Full documentation
├── SETUP.md                 # Installation guide
└── Makefile                 # Dev commands
```

## 🛠️ Common Commands

### Makefile Commands
```bash
make help               # Show all commands
make install           # Install dependencies
make backend           # Run backend
make frontend          # Run frontend
make dev               # Run both
make docker-build      # Build Docker image
make compose           # Docker Compose
make clean             # Clean up
make docs              # Open API docs
```

### Docker Commands
```bash
# Build
docker build -t ai-proof-backend .

# Run
docker run -p 8000:8000 ai-proof-backend

# Compose
docker-compose up --build
docker-compose down

# Logs
docker-compose logs -f
```

### Development Commands
```bash
# Backend
uvicorn backend.app.main:app --reload

# Frontend
cd frontend && npm run dev

# Tests
npm run test

# Build
npm run build
```

## 🔧 Configuration

### Environment Variables (.env)
```
API_HOST=0.0.0.0
API_PORT=8000
NEXT_PUBLIC_API_URL=http://localhost:8000
STEGASTAMP_MODEL_PATH=./app/models/stegastamp_pretrained
WATERMARK_SECRET=AI-PROOF-v1
```

## 🎯 Features Overview

### Generate & Stamp
- Upload any image
- Automatically embeds "AI-PROOF-v1" watermark
- Returns watermarked PNG
- Imperceptible to human eye

### Detect Watermark
- Upload any image
- Returns confidence score (%)
- Shows watermark payload if detected
- Displays frequency heatmap
- Identifies AI-generated content

### Attack Pipeline
- Tests 6 different attacks:
  - Screenshot simulation
  - JPEG compression
  - Cropping
  - Instagram-like filters
  - Rotation
  - Brightness adjustment
- Shows survival rate (%) for each attack
- Interactive detail modal

## 📊 Response Examples

### Stamp Response
```json
{
  "stamped_image": "iVBORw0KGgoAAAA...",
  "watermark": "AI-PROOF-v1",
  "format": "PNG",
  "status": "success"
}
```

### Detection Response
```json
{
  "detected": true,
  "confidence": 0.95,
  "payload": "AI-PROOF-v1",
  "heatmap": "iVBORw0KGgoAAAA...",
  "ai_generated": true,
  "message": "AI-generated image detected",
  "status": "success"
}
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process
lsof -i :8000

# Kill process
kill -9 <PID>
```

### Model Not Loading
- System falls back to simulation mode
- Check model path in config
- Model loading errors are non-fatal

### API Not Responding
1. Check backend is running: `curl http://localhost:8000/api/health`
2. Check port 8000 is open
3. Check firewall settings

### Frontend Can't Connect
1. Verify backend is running
2. Check CORS is enabled (it is by default)
3. Check `NEXT_PUBLIC_API_URL` in .env
4. Clear browser cache

## 📚 Documentation Files

- **README.md** - Full project documentation
- **SETUP.md** - Detailed installation guide
- **IMPLEMENTATION.md** - Implementation details
- **This file** - Quick reference

## 🚀 Deployment Checklist

- [ ] Environment variables configured
- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] API health check passing
- [ ] Test image upload works
- [ ] Detection returns results
- [ ] Heatmap displays correctly
- [ ] All pages load without errors

## 📞 Need Help?

1. Check README.md for detailed docs
2. Review SETUP.md for installation issues
3. Check API docs: http://localhost:8000/docs
4. Review console logs for errors
5. Verify all dependencies installed

---

**API Docs**: http://localhost:8000/docs (Swagger UI)  
**Frontend**: http://localhost:3000  
**Backend**: http://localhost:8000  

**Ready to detect AI-generated images!** 🎯
