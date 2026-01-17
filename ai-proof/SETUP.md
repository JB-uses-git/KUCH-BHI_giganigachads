# AI-PROOF Setup Instructions

## Prerequisites

### System Requirements
- Docker 20.10+ (for containerized deployment)
- Docker Compose 2.0+ (optional, for multi-container setup)
- Python 3.10+ (for local development)
- Node.js 18+ (for frontend development)
- 4GB+ RAM recommended
- 500MB+ disk space for dependencies

## Installation Methods

### Method 1: Docker (Recommended for Production)

#### Build and Run Backend Only

```bash
# Navigate to project root
cd ai-proof

# Build Docker image
docker build -t ai-proof-backend:latest .

# Run container
docker run -p 8000:8000 \
  --name ai-proof-backend \
  ai-proof-backend:latest

# API will be available at http://localhost:8000
# Interactive API docs at http://localhost:8000/docs
```

#### Run Full Stack with Docker Compose

```bash
# From project root
docker-compose up --build

# Logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Method 2: Local Development

#### Setup Backend

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Run development server
uvicorn backend.app.main:app --reload
```

#### Setup Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Frontend will be available at http://localhost:3000
```

### Method 3: Development Environment Setup

#### Full Local Stack

1. **Backend Setup**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

2. **Frontend Setup** (in another terminal):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Access**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs (Swagger UI)
   - ReDoc: http://localhost:8000/redoc

## Verification

### Test Backend Health

```bash
# Health check
curl http://localhost:8000/api/health

# Should return:
# {"status":"healthy","service":"AI-PROOF API"}
```

### Test API Endpoints

```bash
# Test stamp endpoint (POST)
curl -F "file=@/path/to/image.jpg" http://localhost:8000/api/stamp

# Test detect endpoint (POST)
curl -F "file=@/path/to/image.jpg" http://localhost:8000/api/detect
```

### Frontend Verification

1. Open http://localhost:3000 in browser
2. You should see the AI-PROOF landing page
3. Try uploading an image to test functionality

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# Backend
API_HOST=0.0.0.0
API_PORT=8000
STEGASTAMP_MODEL_PATH=./app/models/stegastamp_pretrained
WATERMARK_SECRET=AI-PROOF-v1

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 8000
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### TensorFlow Model Issues

If you get model loading errors:
1. Ensure model files exist at `backend/app/models/stegastamp_pretrained/`
2. The system falls back to simulation mode if model is unavailable
3. Check file permissions and paths

### Frontend Connection Issues

If frontend can't reach backend:
1. Ensure backend is running on port 8000
2. Check CORS settings in `backend/app/main.py`
3. Verify `NEXT_PUBLIC_API_URL` environment variable
4. Clear browser cache and hard refresh (Ctrl+Shift+R)

### Docker Issues

```bash
# Clean up everything
docker-compose down -v
docker system prune -a

# Rebuild from scratch
docker-compose up --build --force-recreate
```

## Production Deployment

### Docker Production Build

```bash
# Build optimized image
docker build -t ai-proof-backend:prod .

# Run with production settings
docker run \
  -p 8000:8000 \
  -e API_HOST=0.0.0.0 \
  -e API_PORT=8000 \
  ai-proof-backend:prod
```

### Frontend Production Build

```bash
cd frontend

# Build Next.js app
npm run build

# Start production server
npm start
```

## Next Steps

1. **Explore the API**: Visit http://localhost:8000/docs for interactive API documentation
2. **Test Watermarking**: Upload an image via the Generate & Stamp page
3. **Verify Detection**: Test detection on your stamped images
4. **Run Pipeline Tests**: Test watermark resilience against attacks

## Support

For issues or questions:
1. Check the README.md for detailed documentation
2. Review API documentation at `/docs` endpoint
3. Check console logs for error messages
4. Ensure all dependencies are correctly installed

---

**You're all set!** The AI-PROOF system is ready to detect AI-generated images.
