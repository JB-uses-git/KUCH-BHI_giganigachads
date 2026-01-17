from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
import io
import base64
import os
import tempfile
from .stegastamp import encode_image, decode_image

app = FastAPI(
    title="AI-PROOF API",
    description="Detect AI-generated images using StegaStamp invisible watermarks",
    version="1.0.0"
)

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    """Health check endpoint."""
    return {
        "status": "ok",
        "message": "AI-PROOF API is running",
        "endpoints": {
            "stamp": "POST /api/stamp - Embed invisible watermark",
            "detect": "POST /api/detect - Detect watermark and AI confidence"
        }
    }

@app.post("/api/stamp")
async def stamp_image(file: UploadFile = File(...), strength: float = 0.7, adaptive: bool = False):
    """
    Embed invisible watermark "AI-PROOF-v1" into an uploaded image.
    
    Args:
        file: Image file to watermark
        strength: Watermark strength 0.0-1.0 (default 0.7, lower = less visible artifacts)
        adaptive: Apply variance-based masking to reduce artifacts in flat areas (default False)
    
    Returns:
        JSON with:
        - stamped_image: base64 encoded PNG
        - watermark: "AI-PROOF-v1"
        - format: "PNG"
        - strength: applied strength value
        - adaptive: whether adaptive masking was used
    """
    try:
        # Check if file is an image
        if not file.content_type or "image" not in file.content_type:
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read file content
        contents = await file.read()
        
        if not contents:
            raise HTTPException(status_code=400, detail="File is empty")
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
            tmp.write(contents)
            tmp_path = tmp.name
        
        try:
            # Encode watermark into image
            stamped_base64 = encode_image(tmp_path, secret="AI-PROOF-v1", strength=strength, adaptive=adaptive)
            
            return JSONResponse({
                "stamped_image": stamped_base64,
                "watermark": "AI-PROOF-v1",
                "format": "PNG",
                "strength": strength,
                "adaptive": adaptive,
                "status": "success"
            })
        finally:
            # Clean up temporary file
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in stamp endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error stamping image: {str(e)}")

@app.post("/api/detect")
async def detect_watermark(file: UploadFile = File(...)):
    """
    Detect watermark and AI confidence in uploaded image.
    
    Returns:
        JSON with:
        - detected: bool (watermark detected)
        - confidence: float (0.0-1.0, AI confidence)
        - payload: str or null (watermark data if detected)
        - heatmap: base64 encoded frequency heatmap
        - ai_generated: bool (true if high confidence watermark detected)
    """
    try:
        # Check if file is an image
        if not file.content_type or "image" not in file.content_type:
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read file content
        contents = await file.read()
        
        if not contents:
            raise HTTPException(status_code=400, detail="File is empty")
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
            tmp.write(contents)
            tmp_path = tmp.name
        
        try:
            # Decode watermark from image
            result = decode_image(tmp_path)
            
            return JSONResponse({
                "detected": result['detected'],
                "confidence": result['confidence'],
                "payload": result['payload'],
                "heatmap": result['heatmap'],
                "ai_generated": result['detected'],  # True if watermark detected
                "status": "success",
                "message": "AI-generated image detected" if result['detected'] else "No watermark detected - likely human-created"
            })
        finally:
            # Clean up temporary file
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in detect endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error detecting watermark: {str(e)}")

@app.get("/api/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "AI-PROOF API"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
