'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface DetectionResult {
  detected: boolean;
  confidence: number;
  payload: string | null;
  heatmap: string;
  ai_generated: boolean;
  message: string;
}

export default function DetectPage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [heatmap, setHeatmap] = useState<string | null>(null);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }

    // Display uploaded image
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Send to backend
    setLoading(true);
    setError(null);
    setResult(null);
    setHeatmap(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

        // Dynamically construct API URL based on current hostname
        const apiUrl = typeof window !== 'undefined'
          ? `http://${window.location.hostname}:8000`
          : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/detect`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data: DetectionResult = await response.json();
      setResult(data);
      if (data.heatmap) {
        setHeatmap(`data:image/png;base64,${data.heatmap}`);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error detecting watermark. Make sure backend is running on http://localhost:8000');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto mb-12"
      >
        <Link
          href="/"
          className="inline-flex items-center text-slate-400 hover:text-pink-400 transition-colors mb-8"
        >
          ← Back to Home
        </Link>
        <h1 className="text-5xl font-bold gradient-text mb-4">Detect Watermark</h1>
        <p className="text-xl text-slate-300">
          Upload an image to detect AI-PROOF watermarks and analyze authenticity
        </p>
      </motion.div>

      <div className="max-w-6xl mx-auto">
        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-glass p-8 rounded-xl mb-8"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={handleClick}
            className={`drag-drop-zone ${dragActive ? 'active' : ''}`}
          >
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold mb-2">Upload Image to Detect</h2>
            <p className="text-slate-400 mb-4">
              Drag and drop your image here, or click to browse
            </p>
            <p className="text-sm text-slate-500">
              Detect watermarks and analyze frequency patterns
            </p>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-900/50 border border-red-500 text-red-200 px-6 py-4 rounded-lg mb-8"
          >
            {error}
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-center py-12"
          >
            <div className="text-4xl mb-4">🔎</div>
            <p className="text-xl text-slate-300">Analyzing image...</p>
          </motion.div>
        )}

        {/* Results Section */}
        {(uploadedImage || result) && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            {/* Image and Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Uploaded Image */}
              <div className="card-glass p-6 rounded-xl">
                <h3 className="text-xl font-bold mb-4 text-pink-400">Uploaded Image</h3>
                <div className="relative bg-slate-800/50 rounded-lg overflow-hidden aspect-square flex items-center justify-center">
                  {uploadedImage && (
                    <img
                      src={uploadedImage}
                      alt="Uploaded"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>

              {/* Detection Results */}
              {result && (
                <div className="card-glass p-6 rounded-xl">
                  <h3 className="text-xl font-bold mb-6 text-emerald-400">Detection Results</h3>

                  {/* Status Badge */}
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`p-4 rounded-lg mb-6 text-center font-bold text-lg ${
                      result.detected
                        ? 'bg-red-900/50 border border-red-500 text-red-200'
                        : result.confidence > 0.5
                        ? 'bg-yellow-900/50 border border-yellow-500 text-yellow-200'
                        : 'bg-green-900/50 border border-green-500 text-green-200'
                    }`}
                  >
                    {result.detected 
                      ? '⚠️ AI-GENERATED DETECTED' 
                      : result.confidence > 0.5
                      ? '⚠️ UNCERTAIN - Weak Watermark Signal'
                      : '✅ AUTHENTIC IMAGE'}
                  </motion.div>

                  {/* Confidence Score */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-300 font-semibold">Watermark Confidence</span>
                      <span className="text-lg font-bold text-blue-400">
                        {(result.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${result.confidence * 100}%` }}
                        transition={{ duration: 1 }}
                        className={`h-full rounded-full ${
                          result.detected
                            ? 'bg-gradient-to-r from-red-500 to-red-600'
                            : result.confidence > 0.5
                            ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                            : 'bg-gradient-to-r from-green-500 to-green-600'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Watermark Info */}
                  {result.payload && (
                    <div className="bg-slate-800/50 p-4 rounded-lg mb-6">
                      <p className="text-slate-400 text-sm mb-2">Watermark Payload:</p>
                      <p className="text-blue-400 font-mono font-bold text-lg">
                        {result.payload}
                      </p>
                    </div>
                  )}

                  {/* Message */}
                  <p className="text-slate-300 text-sm">
                    {result.detected 
                      ? result.message 
                      : result.confidence > 0.5
                      ? `Partial watermark signal detected (${(result.confidence * 100).toFixed(1)}%) but below detection threshold (85%). Image may have been modified or attacked.`
                      : result.message}
                  </p>
                </div>
              )}
            </div>

            {/* Frequency Heatmap */}
            {heatmap && (
              <div className="card-glass p-6 rounded-xl">
                <h3 className="text-xl font-bold mb-4 text-purple-400">Frequency Domain Heatmap</h3>
                <p className="text-slate-400 text-sm mb-4">
                  FFT analysis showing frequency components where watermark patterns appear
                </p>
                <div className="bg-slate-800/50 rounded-lg overflow-hidden">
                  <img
                    src={heatmap}
                    alt="Frequency Heatmap"
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* Detection Details */}
            {result && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card-glass p-6 rounded-lg text-center">
                  <div className="text-3xl mb-3">
                    {result.detected ? '⚠️' : '✅'}
                  </div>
                  <h4 className="font-bold mb-2">Detection Status</h4>
                  <p className="text-slate-400 text-sm">
                    {result.detected ? 'Watermark Found' : 'No Watermark'}
                  </p>
                </div>
                <div className="card-glass p-6 rounded-lg text-center">
                  <div className="text-3xl mb-3">📊</div>
                  <h4 className="font-bold mb-2">Confidence Level</h4>
                  <p className="text-blue-400 font-bold text-lg">
                    {(result.confidence * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="card-glass p-6 rounded-lg text-center">
                  <div className="text-3xl mb-3">
                    {result.ai_generated ? '🤖' : '👤'}
                  </div>
                  <h4 className="font-bold mb-2">Content Type</h4>
                  <p className="text-slate-400 text-sm">
                    {result.ai_generated ? 'AI-Generated' : 'Human-Created'}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Empty State Info */}
        {!uploadedImage && !result && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12"
          >
            <div className="card-glass p-6 rounded-lg">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-bold mb-2">How It Works</h3>
              <p className="text-slate-400 text-sm">
                Our detection algorithm analyzes the frequency domain of your image to identify
                invisible watermark patterns that prove AI generation.
              </p>
            </div>
            <div className="card-glass p-6 rounded-lg">
              <div className="text-3xl mb-3">📈</div>
              <h3 className="font-bold mb-2">High Accuracy</h3>
              <p className="text-slate-400 text-sm">
                Using machine learning and frequency analysis, we detect watermarks with high
                precision across various image formats and qualities.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
