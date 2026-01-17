# AI-PROOF: Detect AI-Generated Images with Invisible Watermarks

A full-stack hackathon project that detects AI-generated images using StegaStamp invisible watermarks. The system can embed imperceptible watermarks into images and detect them with high precision, proving authenticity and detecting AI-generated content.

## Features

- **🖼️ Generate & Stamp**: Embed invisible "AI-PROOF-v1" watermarks into images
- **🔍 Detection**: Detect watermarks and AI-generated content with confidence scoring
- **📊 Frequency Analysis**: Visualize watermark patterns in frequency domain
- **⚔️ Attack Resilience**: Test watermark survival against common image transformations (screenshot, compression, cropping, filters)
- **🎯 High Accuracy**: Machine learning-based detection using TensorFlow

## Project Structure

```
ai-proof/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI application with endpoints
│   │   ├── stegastamp.py     # StegaStamp wrapper for encoding/decoding
│   │   └── models/
│   │       └── stegastamp_pretrained/  # Pretrained TensorFlow model
│   ├── requirements.txt       # Python dependencies
│   └── __init__.py
├── frontend/
│   ├── app/
│   │   ├── page.tsx          # Landing page
│   │   ├── layout.tsx        # Root layout
│   │   ├── globals.css       # Global styles
│   │   ├── generate/
│   │   │   ├── page.tsx      # Generate & Stamp page
│   │   │   └── layout.tsx
│   │   ├── detect/
│   │   │   ├── page.tsx      # Detect watermark page
│   │   │   └── layout.tsx
│   │   └── pipeline/
│   │       ├── page.tsx      # Attack testing page
│   │       └── layout.tsx
│   ├── package.json          # Node dependencies
│   ├── tsconfig.json         # TypeScript config
│   ├── tailwind.config.js    # Tailwind CSS config
│   ├── postcss.config.js     # PostCSS config
│   └── next.config.js        # Next.js config
├── Dockerfile                # Docker image for backend
├── .env.example              # Environment variables template
└── README.md                 # This file
```

## Quick Start

### Prerequisites

- Docker and Docker Compose (for containerized deployment)
- OR Python 3.10+ and Node.js 18+ (for local development)

### Using Docker

1. **Build the backend image**:
   ```bash
   docker build -t ai-proof-backend .
   ```

2. **Run the backend**:
   ```bash
   docker run -p 8000:8000 ai-proof-backend
   ```

3. **Run the frontend** (in a separate terminal):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Local Development

#### Backend Setup

1. **Install Python dependencies**:
   ```bash
   pip install -r backend/requirements.txt
   ```

2. **Run FastAPI server**:
   ```bash
   uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
   ```

#### Frontend Setup

1. **Install Node dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

3. **Open browser**: http://localhost:3000

## API Endpoints

### POST `/api/stamp`
Embed invisible watermark into an image.

**Request**:
- Form data with `file` (image file)

**Response**:
```json
{
  "stamped_image": "base64_encoded_png",
  "watermark": "AI-PROOF-v1",
  "format": "PNG",
  "status": "success"
}
```

### POST `/api/detect`
Detect watermark and AI confidence in an image.

**Request**:
- Form data with `file` (image file)

**Response**:
```json
{
  "detected": true,
  "confidence": 0.95,
  "payload": "AI-PROOF-v1",
  "heatmap": "base64_encoded_heatmap",
  "ai_generated": true,
  "message": "AI-generated image detected",
  "status": "success"
}
```

### GET `/api/health`
Health check endpoint.

**Response**:
```json
{
  "status": "healthy",
  "service": "AI-PROOF API"
}
```

## Technology Stack

### Backend
- **FastAPI** 0.109.0 - Modern Python web framework
- **TensorFlow** 1.15.5 - Machine learning framework
- **OpenCV** 4.8.1.78 - Image processing
- **Pillow** 9.5.0 - Image manipulation
- **Pydantic** 2.5.0 - Data validation

### Frontend
- **Next.js** 15 - React framework
- **React** 18.3.1 - UI library
- **Tailwind CSS** 3.4.1 - Utility-first CSS
- **Framer Motion** 11.0.0 - Animation library
- **TypeScript** 5.3.3 - Type safety

### Deployment
- **Docker** - Containerization
- **Python 3.10-slim** - Lightweight base image

## Features Explained

### 1. Generate & Stamp Page
- Drag-and-drop image upload
- Calls `/api/stamp` endpoint to embed watermark
- Side-by-side comparison of original and watermarked images
- Download option for watermarked image
- Visual indicators showing successful watermarking

### 2. Detect Page
- Upload any image for watermark detection
- Returns confidence score (0-100%)
- Displays frequency domain heatmap
- Shows watermark payload if detected
- Indicates whether image is AI-generated

### 3. Pipeline Page
- Test watermark resilience against attacks:
  - **Screenshot**: Screen capture degradation
  - **JPEG Compression**: Lossy compression at 85% quality
  - **Cropping**: 20% center crop and scale back
  - **Instagram Filter**: Filter simulation
  - **Rotation**: 5-degree rotation with auto-crop
  - **Brightness Adjustment**: +/- 20% brightness variation
- Displays survival rates for each attack
- Interactive modal for detailed metrics
- Average resilience calculation

### 4. Landing Page
- Hero section with project description
- Three main action buttons
- Feature cards explaining capabilities
- Responsive design with animations

## Watermarking Algorithm

The StegaStamp model uses:
1. **Encoder**: Embeds invisible watermark into image using adversarial training
2. **Decoder**: Extracts and verifies watermark presence using CNN
3. **Frequency Domain Analysis**: FFT-based heatmap visualization
4. **Robustness Testing**: Survival against common image transformations

## Error Handling

- Missing files: Returns appropriate HTTP 400/404 errors
- Invalid image formats: Validates file type before processing
- API failures: User-friendly error messages in UI
- Network errors: Graceful fallback with retry options

## Development Notes

- **TensorFlow Session**: Uses TensorFlow 1.15 compatibility mode for graph execution
- **CORS**: Backend allows requests from any origin (configurable in production)
- **Image Format**: Processes images as base64 for API transmission
- **Session Management**: Lazy loads model on first use, caches for subsequent requests

## Building for Production

### Backend

```bash
# Build Docker image
docker build -t ai-proof-backend:latest .

# Run with health checks
docker run -p 8000:8000 \
  --health-cmd='curl -f http://localhost:8000/api/health || exit 1' \
  --health-interval=30s \
  ai-proof-backend:latest
```

### Frontend

```bash
# Build optimized Next.js bundle
npm run build

# Start production server
npm start
```

## Future Enhancements

- [ ] Support for video watermarking
- [ ] Batch processing API for multiple images
- [ ] Custom watermark payload support
- [ ] Enhanced attack simulation with GAN-based attacks
- [ ] Web-based model training pipeline
- [ ] User authentication and watermark history
- [ ] Rate limiting and usage analytics

## License

MIT License - See LICENSE file for details

## Authors

AI-PROOF Hackathon Team

---

**Note**: This project uses StegaStamp, a research paper implementation. For production use, ensure proper licensing and model attribution.
