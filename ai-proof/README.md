# AI-PROOF: Invisible Watermark System for AI-Generated Image Detection

> A production-ready watermarking system that embeds imperceptible watermarks into images and detects them with high precision, even after common image transformations and attacks.

![AI-PROOF](https://img.shields.io/badge/Status-Production--Ready-green) ![Docker](https://img.shields.io/badge/Docker-Ready-blue) ![License](https://img.shields.io/badge/License-MIT-yellow)

## 🎯 Overview

AI-PROOF is a full-stack application that uses deep learning to embed invisible watermarks into images and detect them later. Built with StegaStamp technology, it can survive JPEG compression, resizing, cropping, and other common image transformations - making it perfect for tracking AI-generated content, proving image authenticity, or protecting digital assets.

**Key Capabilities:**
- 🔐 Embed invisible "AI-PROOF-v1" watermarks with adjustable strength
- 🔍 Detect watermarks with confidence scoring (0-100%)
- ⚔️ Test robustness against 20 different attack scenarios
- 📊 Visualize watermark patterns in frequency domain
- 🎨 Adaptive masking to reduce visible artifacts
- 🚀 80%+ survival rate against real-world attacks

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Usage Guide](#-usage-guide)
- [API Documentation](#-api-documentation)
- [Watermark Settings](#-watermark-settings)
- [Attack Pipeline](#-attack-pipeline)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

### 1. **Generate & Stamp** - Watermark Your Images
- Upload any image (PNG, JPEG, WebP, GIF)
- Adjust watermark strength (10% - 100%)
- Enable adaptive masking to reduce artifacts in flat areas
- Side-by-side comparison of original vs stamped
- Download watermarked images

### 2. **Detect** - Verify Watermark Presence
- Three-tier detection system:
  - ✅ **Authentic** (confidence < 50%) - No watermark
  - ⚠️ **Uncertain** (confidence 50-85%) - Weak signal, possibly attacked
  - 🚨 **AI-Generated** (confidence > 85%) - Watermark clearly detected
- Frequency domain heatmap visualization
- Watermark payload extraction

### 3. **Attack Pipeline** - Test Robustness
- Automatically stamps your image
- Runs 20 attack scenarios across 8 types:
  - **JPEG Compression** (4 levels: 90%, 70%, 50%, 25% quality)
  - **Resize** (3 scales: 90%, 75%, 50%)
  - **Crop** (3 amounts: 95%, 85%, 75%)
  - **Blur** (3 intensities: σ=0.5, 1.0, 2.0)
  - **Noise** (3 levels: σ=5, 15, 30)
  - **Rotation** (2 angles: ±5°, ±10°)
  - **Brightness** adjustment
  - **Format conversion** (PNG→JPEG→PNG)
- Real-time progress tracking
- Comprehensive results with robustness metrics
- Interactive charts grouped by attack type

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │   Generate   │  │    Detect    │  │   Attack Pipeline    │ │
│  │     Page     │  │     Page     │  │        Page          │ │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘ │
│         │                 │                      │              │
│         └─────────────────┴──────────────────────┘              │
│                           │                                     │
│                    localhost:3000                               │
└───────────────────────────┼─────────────────────────────────────┘
                            │ HTTP/REST
┌───────────────────────────┼─────────────────────────────────────┐
│                    Backend (FastAPI)                            │
│                    localhost:8000                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐    │
│  │ /api/stamp  │  │ /api/detect │  │    /api/attack      │    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────────────┘    │
│         │                │                 │                    │
│         └────────────────┴─────────────────┘                    │
│                          │                                      │
│         ┌────────────────┴────────────────┐                    │
│         │   StegaStamp Wrapper Module     │                    │
│         │  • encode_image()                │                    │
│         │  • decode_image()                │                    │
│         │  • Strength & Adaptive Masking   │                    │
│         └────────────────┬────────────────┘                    │
│                          │                                      │
│         ┌────────────────┴────────────────┐                    │
│         │   TensorFlow 1.15 SavedModel    │                    │
│         │  stegastamp_pretrained/         │                    │
│         │  • Encoder Network               │                    │
│         │  • Decoder Network               │                    │
│         └──────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

**Data Flow:**
1. User uploads image → Frontend
2. Frontend sends to Backend API
3. Backend loads image → StegaStamp Model
4. Model processes (encode/decode) → Returns result
5. Backend sends response → Frontend displays

---

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd ai-proof

# Start both frontend and backend
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Option 2: Docker (Manual)

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
### Option 2: Docker (Manual)

```bash
# Build backend image
docker build -t ai-proof-backend .

# Run backend
docker run -d -p 8000:8000 --name backend ai-proof-backend

# Install frontend dependencies
cd frontend
npm install

# Run frontend
npm run dev
```

### Option 3: Local Development

**Backend:**
```bash
# Install Python dependencies
pip install -r backend/requirements.txt

# Run FastAPI server
cd ai-proof
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
# Install Node dependencies
cd frontend
npm install

# Run Next.js development server
npm run dev
```

---

## 📖 Usage Guide

### 1. Stamping an Image

1. Navigate to **Generate** page
2. Upload your image (drag-and-drop or click)
3. **Adjust settings:**
   - **Strength**: 10%-100% (default: 70%)
     - Lower = Less visible, less robust
     - Higher = More robust, may have artifacts
   - **Adaptive Masking**: ON/OFF (reduces artifacts in flat areas)
4. Click **Stamp Image**
5. Compare original vs stamped images
6. Download the watermarked version

**Recommended Settings:**
- **Balanced**: 70% strength, Adaptive ON
- **Maximum Stealth**: 30% strength, Adaptive ON
- **Maximum Robustness**: 100% strength, Adaptive OFF

### 2. Detecting a Watermark

1. Navigate to **Detect** page
2. Upload an image to analyze
3. View results:
   - **Status**: Authentic, Uncertain, or AI-Generated
   - **Confidence Score**: 0-100%
   - **Heatmap**: Frequency domain visualization
   - **Payload**: Extracted watermark text (if detected)

**Interpreting Results:**
- `0-50%`: No watermark detected (authentic)
- `50-85%`: Partial signal (image may have been attacked/modified)
- `85-100%`: Watermark clearly present (AI-generated confirmed)

### 3. Testing Attack Robustness

1. Navigate to **Attack Pipeline** page
2. Adjust watermark settings (strength & adaptive)
3. Upload any image
4. System automatically:
   - Stamps your image with chosen settings
   - Runs 20 attack scenarios
   - Tests watermark detection on each attacked version
5. View comprehensive results:
   - Robustness percentage
   - Attacks survived count
   - Average confidence
   - Detailed table of all results
   - Bar chart grouped by attack type

**Example Results:**
```
Robustness: 80% (16/20 attacks survived)
├─ JPEG Compression: 100% (4/4)
├─ Resize: 100% (3/3)
├─ Blur: 100% (3/3)
├─ Noise: 67% (2/3)
├─ Crop: 33% (1/3)
└─ Rotate: 50% (1/2)
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:8000
```

### Endpoints

#### 1. **POST** `/api/stamp`

Embed invisible watermark into an image.

**Parameters:**
- `file` (form-data): Image file
- `strength` (query, optional): 0.1-1.0 (default: 0.7)
- `adaptive` (query, optional): true/false (default: false)

**Request:**
```bash
curl -X POST "http://localhost:8000/api/stamp?strength=0.7&adaptive=true" \
  -F "file=@image.jpg"
```

**Response:**
```json
{
  "stamped_image": "iVBORw0KGgoAAAANS...",  // base64 PNG
  "watermark": "AI-PROOF-v1",
  "format": "PNG",
  "strength": 0.7,
  "adaptive": true,
  "status": "success"
}
```

#### 2. **POST** `/api/detect`

Detect watermark in an image.

**Parameters:**
- `file` (form-data): Image file

**Request:**
```bash
curl -X POST "http://localhost:8000/api/detect" \
  -F "file=@stamped_image.png"
```

**Response:**
```json
{
  "detected": true,
  "confidence": 0.98,
  "payload": "AI-PROOF-v1",
  "heatmap": "iVBORw0KGgo...",  // base64 PNG
  "ai_generated": true,
  "message": "AI-generated image detected",
  "status": "success"
}
```

#### 3. **POST** `/api/attack`

Apply attack transformation and test detection.

**Parameters:**
- `file` (form-data): Image file
- `attack_type` (query): jpeg | resize | crop | blur | noise | rotate | brightness | format
- `severity` (query): 0.0-1.0

**Request:**
```bash
curl -X POST "http://localhost:8000/api/attack?attack_type=jpeg&severity=0.5" \
  -F "file=@stamped_image.png"
```

**Response:**
```json
{
  "detected": true,
  "confidence": 0.92,
  "attacked_image": "iVBORw0KGgo...",  // base64
  "attack_type": "jpeg",
  "severity": 0.5,
  "description": "JPEG compression at quality 50"
}
```

#### 4. **GET** `/api/attacks`

Get list of predefined attack scenarios.

**Response:**
```json
{
  "attacks": [
    {"name": "JPEG 90", "type": "jpeg", "severity": 0.1},
    {"name": "JPEG 70", "type": "jpeg", "severity": 0.3},
    ...
  ]
}
```

#### 5. **GET** `/` or `/api/health`

Health check.

**Response:**
```json
{
  "status": "ok",
  "message": "AI-PROOF API is running"
}
```

---

## ⚙️ Watermark Settings

### Strength Parameter

Controls the intensity of the watermark residual applied to the image.

| Strength | Visual Impact | Robustness | Use Case |
|----------|--------------|------------|----------|
| 0.1-0.3  | Minimal/None | Low | Maximum stealth, casual use |
| 0.4-0.6  | Very Subtle  | Medium | Balanced for most use cases |
| 0.7-0.8  | Subtle       | High | **Recommended default** |
| 0.9-1.0  | May be visible in flat areas | Very High | Maximum protection |

### Adaptive Masking

When enabled, reduces watermark strength in uniform/flat areas of the image based on local variance.

**Benefits:**
- Significantly reduces visible artifacts
- Maintains robustness in textured areas
- Recommended for images with large flat regions (sky, backgrounds)

**Trade-offs:**
- Slightly reduced robustness in masked areas
- May not survive severe cropping if flat areas dominate

---

## ⚔️ Attack Pipeline

### Supported Attack Types

| Attack | Variants | Description | Typical Survival Rate |
|--------|----------|-------------|---------------------|
| **JPEG Compression** | 4 levels | Quality: 90%, 70%, 50%, 25% | 100% |
| **Resize** | 3 scales | Scale: 90%, 75%, 50% | 100% |
| **Center Crop** | 3 amounts | Keep: 95%, 85%, 75% of image | 33%-100% |
| **Gaussian Blur** | 3 intensities | σ = 0.5, 1.0, 2.0 | 100% |
| **Gaussian Noise** | 3 levels | σ = 5, 15, 30 | 67%-100% |
| **Rotation** | 2 angles | ±5°, ±10° with auto-crop | 50% |
| **Brightness** | 1 level | ±15% adjustment | 100% |
| **Format Conversion** | 1 | PNG→JPEG→PNG roundtrip | 100% |

### Performance Metrics

**Typical Results** (strength=0.7, adaptive=false):
```
Total Attacks: 20
Survived: 16/20 (80%)
Average Confidence: 0.86

Strong Performers (100% survival):
✓ JPEG Compression (all levels)
✓ Resize (all scales)
✓ Blur (all intensities)
✓ Brightness adjustment
✓ Format conversion

Weaknesses:
✗ Heavy cropping (75%+ removed)
✗ High noise (σ=30)
✗ Large rotation (±10°)
```

---

## 🛠️ Technology Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **FastAPI** | 0.109.0 | REST API framework |
| **TensorFlow** | 1.15.5 | Deep learning model |
| **OpenCV** | 4.8.1 | Image processing |
| **NumPy** | 1.21.0 | Numerical operations |
| **Pillow** | 9.5.0 | Image I/O |
| **Python** | 3.7-3.10 | Runtime |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.2.35 | React framework |
| **React** | 18.3.1 | UI library |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 3.4.1 | Styling |
| **Framer Motion** | 11.0.0 | Animations |

### Infrastructure
- **Docker** & **Docker Compose**: Containerization
- **Uvicorn**: ASGI server
- **CORS Middleware**: Cross-origin requests

---

## 📁 Project Structure

```
ai-proof/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app with all endpoints
│   │   ├── stegastamp.py           # StegaStamp wrapper (encode/decode)
│   │   ├── attacks.py              # Image attack transformations
│   │   └── models/
│   │       └── stegastamp_pretrained/  # TF SavedModel
│   │           ├── saved_model.pb
│   │           └── variables/
│   ├── requirements.txt            # Python dependencies
│   └── __init__.py
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx               # Landing page
│   │   ├── layout.tsx             # Root layout
│   │   ├── globals.css            # Global styles + animations
│   │   ├── generate/
│   │   │   └── page.tsx           # Generate & Stamp page
│   │   ├── detect/
│   │   │   └── page.tsx           # Detection page
│   │   └── pipeline/
│   │       └── page.tsx           # Attack pipeline page
│   ├── public/                    # Static assets
│   ├── package.json               # Node dependencies
│   ├── tsconfig.json              # TypeScript config
│   ├── tailwind.config.js         # Tailwind CSS config
│   └── next.config.js             # Next.js config
│
├── docker-compose.yml             # Multi-container orchestration
├── Dockerfile                     # Backend container image
├── frontend.Dockerfile            # Frontend container image
├── .gitignore                     # Git ignore rules
├── test_pipeline.py               # Pipeline test script
├── test_full_pipeline.py          # Full 20-attack test script
└── README.md                      # This file
```

---

## 💻 Development

### Running Tests

**Quick Test (5 attacks):**
```bash
python test_pipeline.py
```

**Full Test (20 attacks):**
```bash
python test_full_pipeline.py
```

**Expected Output:**
```
ATTACK PIPELINE TEST
============================================================
1. Creating test image... ✓
2. Fetching attacks... ✓ Got 20 attack variants
3. Stamping image... ✓ Image stamped successfully
4. Running attacks...
   1. JPEG 90              ✓ conf: 0.98
   2. JPEG 70              ✓ conf: 0.99
   ...
   20. JPEG Roundtrip      ✓ conf: 0.99

SUMMARY
======================================================================
Total attacks: 20
Survived: 16/20 (80%)
Average confidence: 0.86
✓ GOOD - Watermark shows good resilience
```

---

## 🐛 Troubleshooting

### Backend Issues

**Problem:** "Failed to load image" error
- Check file format is valid (PNG, JPEG, WebP, GIF)
- Ensure file size is under 10MB
- Verify file permissions

**Problem:** TensorFlow errors
```bash
# Ensure correct version
pip install tensorflow==1.15.5

# Check model files exist
ls backend/app/models/stegastamp_pretrained/
# Should see: saved_model.pb, variables/
```

**Problem:** Port already in use
```bash
docker-compose down
# Or kill process on port
lsof -ti:8000 | xargs kill -9  # Linux/Mac
netstat -ano | findstr :8000   # Windows (then taskkill)
```

### Frontend Issues

**Problem:** Cannot connect to backend
- Check both services running: `docker-compose ps`
- Backend should be on http://localhost:8000
- Test: `curl http://localhost:8000/`

**Problem:** Build errors
```bash
cd frontend
rm -rf .next node_modules
npm install
npm run dev
```

### Docker Issues

**Problem:** Out of disk space
```bash
docker system prune -a --volumes
```

**Problem:** Container won't start
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild
docker-compose build --no-cache
docker-compose up -d
```

---

## 📚 How It Works

### Watermark Embedding Process

1. **Input Processing**: Image resized to 400×400, normalized [0,1]
2. **Secret Encoding**: "AI-PROOF-v1" → 100-bit pattern
3. **Neural Network**: StegaStamp encoder generates imperceptible residual
4. **Strength & Masking**: Residual scaled and optionally masked
5. **Output**: Watermarked image as base64 PNG

### Watermark Detection Process

1. **Input Processing**: Image preprocessed (resize, normalize)
2. **Neural Decoding**: StegaStamp decoder outputs 100 continuous values
3. **Clustering Analysis**: Count extreme bits (<0.15 or >0.85)
4. **Pattern Matching**: Compare with expected pattern
5. **Detection**: Detected if cluster_ratio > 0.7 AND pattern_accuracy > 0.85
6. **Confidence**: Geometric mean of both metrics

---

## 🎓 Research & References

Based on **StegaStamp: Invisible Hyperlinks in Physical Photographs**  
Authors: Matthew Tancik, Ben Mildenhall, Ren Ng (UC Berkeley)  
Conference: CVPR 2020

**Original Repository:** https://github.com/tancik/StegaStamp

---

## 📝 License

MIT License

Copyright (c) 2026 AI-PROOF Team

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.

---

## 🎯 Future Roadmap

### Planned Features
- [ ] Custom watermark payloads (text, IDs, URLs)
- [ ] Batch processing API for multiple images
- [ ] User authentication and watermark history
- [ ] Video watermarking support
- [ ] Mobile app (React Native)
- [ ] Cloud deployment (AWS/GCP)
- [ ] Advanced GAN-based attack testing
- [ ] Real-time watermark detection
- [ ] Blockchain-based authenticity verification
- [ ] Enterprise licensing and SDK

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

**Guidelines:**
- Follow PEP 8 for Python, ESLint for TypeScript
- Add tests for new features
- Update documentation
- Keep commits atomic and descriptive

---

<div align="center">

**⭐ Star this repo if you find it useful!**

Made with ❤️ by the AI-PROOF Team

[Report Bug](https://github.com/your-repo/ai-proof/issues) · [Request Feature](https://github.com/your-repo/ai-proof/issues) · [Documentation](https://github.com/your-repo/ai-proof/wiki)

</div>
