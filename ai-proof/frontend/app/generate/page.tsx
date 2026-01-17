'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function GeneratePage() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [stampedImage, setStampedImage] = useState<string | null>(null);
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

    // Display original image
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Send to backend
    setLoading(true);
    setError(null);
    setStampedImage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

        // Dynamically construct API URL based on current hostname
        const apiUrl = typeof window !== 'undefined'
          ? `http://${window.location.hostname}:8000`
          : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/stamp`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      setStampedImage(`data:image/png;base64,${data.stamped_image}`);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error stamping image. Make sure backend is running on http://localhost:8000');
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

  const downloadImage = (imageData: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          className="inline-flex items-center text-slate-400 hover:text-blue-400 transition-colors mb-8"
        >
          ← Back to Home
        </Link>
        <h1 className="text-5xl font-bold gradient-text mb-4">Generate & Stamp</h1>
        <p className="text-xl text-slate-300">
          Embed invisible watermark "AI-PROOF-v1" into your images
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
            <div className="text-5xl mb-4">📁</div>
            <h2 className="text-2xl font-bold mb-2">Upload Your Image</h2>
            <p className="text-slate-400 mb-4">
              Drag and drop your image here, or click to browse
            </p>
            <p className="text-sm text-slate-500">
              Supported formats: PNG, JPEG, WebP, GIF
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
            <div className="text-4xl mb-4">✨</div>
            <p className="text-xl text-slate-300">Embedding watermark...</p>
          </motion.div>
        )}

        {/* Results Section */}
        {(originalImage || stampedImage) && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* Original Image */}
            <div className="card-glass p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-4 text-blue-400">Original Image</h3>
              <div className="relative bg-slate-800/50 rounded-lg overflow-hidden aspect-square flex items-center justify-center">
                {originalImage && (
                  <img
                    src={originalImage}
                    alt="Original"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>

            {/* Stamped Image */}
            <div className="card-glass p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-4 text-pink-400">Watermarked Image</h3>
              <div className="relative bg-slate-800/50 rounded-lg overflow-hidden aspect-square flex items-center justify-center">
                {stampedImage ? (
                  <>
                    <img
                      src={stampedImage}
                      alt="Stamped"
                      className="w-full h-full object-cover"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute top-4 right-4 bg-green-500/80 text-white px-4 py-2 rounded-full font-semibold text-sm"
                    >
                      ✓ Watermarked
                    </motion.div>
                  </>
                ) : (
                  <p className="text-slate-500">Watermark will appear here</p>
                )}
              </div>

              {stampedImage && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => downloadImage(stampedImage, 'ai-proof-stamped.png')}
                  className="button-primary w-full mt-6"
                >
                  📥 Download Watermarked Image
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {/* Info Section */}
        {!originalImage && !stampedImage && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
          >
            <div className="card-glass p-6 rounded-lg text-center">
              <div className="text-3xl mb-3">🔐</div>
              <h3 className="font-bold mb-2">Imperceptible</h3>
              <p className="text-slate-400 text-sm">
                Watermarks are invisible to the human eye
              </p>
            </div>
            <div className="card-glass p-6 rounded-lg text-center">
              <div className="text-3xl mb-3">💪</div>
              <h3 className="font-bold mb-2">Robust</h3>
              <p className="text-slate-400 text-sm">
                Survives compression and minor edits
              </p>
            </div>
            <div className="card-glass p-6 rounded-lg text-center">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-bold mb-2">Fast</h3>
              <p className="text-slate-400 text-sm">
                Process images instantly
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
