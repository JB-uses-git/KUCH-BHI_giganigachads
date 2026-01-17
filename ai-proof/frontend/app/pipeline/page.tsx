'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface AttackResult {
  name: string;
  survival_rate: number;
  image: string | null;
  description: string;
}

export default function PipelinePage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [attackResults, setAttackResults] = useState<AttackResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedAttack, setSelectedAttack] = useState<AttackResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const attacks = [
    {
      name: 'Screenshot',
      description: 'Simulates screen capture degradation',
      survivalRate: 0.95,
    },
    {
      name: 'JPEG Compression',
      description: 'Lossy compression at 85% quality',
      survivalRate: 0.92,
    },
    {
      name: 'Cropping',
      description: '20% center crop and scale back',
      survivalRate: 0.88,
    },
    {
      name: 'Instagram Filter',
      description: 'Simulates Instagram-like filters',
      survivalRate: 0.85,
    },
    {
      name: 'Rotation',
      description: '5 degree rotation with auto-crop',
      survivalRate: 0.91,
    },
    {
      name: 'Brightness Adjustment',
      description: '+/- 20% brightness variation',
      survivalRate: 0.94,
    },
  ];

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

    // Simulate running attacks
    setLoading(true);
    setError(null);
    setAttackResults([]);
    setSelectedAttack(null);

    // Simulate attacks with random variation
    const results: AttackResult[] = attacks.map((attack) => ({
      name: attack.name,
      description: attack.description,
      survival_rate: attack.survivalRate + (Math.random() - 0.5) * 0.1,
      image: null, // In real app, would get from backend
    }));

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setAttackResults(results);
    setLoading(false);
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

  const getRiskLevel = (rate: number) => {
    if (rate >= 0.9) return { label: 'Low Risk', color: 'text-green-400', bg: 'bg-green-900/30' };
    if (rate >= 0.8) return { label: 'Medium Risk', color: 'text-yellow-400', bg: 'bg-yellow-900/30' };
    return { label: 'High Risk', color: 'text-red-400', bg: 'bg-red-900/30' };
  };

  const avgSurvivalRate =
    attackResults.length > 0
      ? attackResults.reduce((sum, r) => sum + r.survival_rate, 0) / attackResults.length
      : 0;

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
          className="inline-flex items-center text-slate-400 hover:text-purple-400 transition-colors mb-8"
        >
          ← Back to Home
        </Link>
        <h1 className="text-5xl font-bold gradient-text mb-4">Attack Pipeline</h1>
        <p className="text-xl text-slate-300">
          Test watermark resilience against common image attacks and transformations
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
            <div className="text-5xl mb-4">📸</div>
            <h2 className="text-2xl font-bold mb-2">Upload Watermarked Image</h2>
            <p className="text-slate-400 mb-4">
              Use an image you stamped with AI-PROOF watermark
            </p>
            <p className="text-sm text-slate-500">
              We'll test its survival through various attacks
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
            <div className="text-4xl mb-4">⚔️</div>
            <p className="text-xl text-slate-300">Testing attacks...</p>
          </motion.div>
        )}

        {/* Results Section */}
        {attackResults.length > 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            {/* Image Display */}
            {uploadedImage && (
              <div className="card-glass p-6 rounded-xl">
                <h3 className="text-xl font-bold mb-4 text-purple-400">Test Image</h3>
                <div className="bg-slate-800/50 rounded-lg overflow-hidden max-w-md">
                  <img
                    src={uploadedImage}
                    alt="Test"
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card-glass p-6 rounded-xl text-center"
              >
                <div className="text-4xl font-bold gradient-text mb-2">
                  {(avgSurvivalRate * 100).toFixed(1)}%
                </div>
                <p className="text-slate-400">Average Survival Rate</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="card-glass p-6 rounded-xl text-center"
              >
                <div className="text-4xl font-bold text-green-400 mb-2">
                  {attackResults.filter((r) => r.survival_rate >= 0.9).length}
                </div>
                <p className="text-slate-400">Highly Resilient</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="card-glass p-6 rounded-xl text-center"
              >
                <div className="text-4xl font-bold text-blue-400 mb-2">
                  {attackResults.length}
                </div>
                <p className="text-slate-400">Attacks Tested</p>
              </motion.div>
            </div>

            {/* Attack Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {attackResults.map((result, index) => {
                const riskLevel = getRiskLevel(result.survival_rate);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="card-glass p-6 rounded-lg cursor-pointer hover:border-purple-400 transition-colors"
                    onClick={() => setSelectedAttack(result)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold mb-1">{result.name}</h3>
                        <p className="text-sm text-slate-400">{result.description}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${riskLevel.bg} ${riskLevel.color}`}
                      >
                        {riskLevel.label}
                      </span>
                    </div>

                    {/* Survival Rate Bar */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${result.survival_rate * 100}%` }}
                            transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                          />
                        </div>
                      </div>
                      <span className="font-bold text-lg min-w-fit">
                        {(result.survival_rate * 100).toFixed(1)}%
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Detailed View Modal */}
            {selectedAttack && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                onClick={() => setSelectedAttack(null)}
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="card-glass p-8 rounded-xl max-w-2xl w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h2 className="text-3xl font-bold mb-4 text-purple-400">
                    {selectedAttack.name}
                  </h2>

                  <p className="text-slate-300 mb-6">
                    {selectedAttack.description}
                  </p>

                  {/* Detailed Metrics */}
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-slate-800/50 p-4 rounded-lg text-center">
                      <p className="text-slate-400 text-sm mb-2">Survival Rate</p>
                      <p className="text-3xl font-bold text-purple-400">
                        {(selectedAttack.survival_rate * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg text-center">
                      <p className="text-slate-400 text-sm mb-2">Watermark Integrity</p>
                      <p className="text-3xl font-bold text-blue-400">
                        {(selectedAttack.survival_rate * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg text-center">
                      <p className="text-slate-400 text-sm mb-2">Detectability</p>
                      <p className="text-3xl font-bold text-green-400">
                        {(selectedAttack.survival_rate > 0.85 ? 'High' : 'Medium')}
                      </p>
                    </div>
                  </div>

                  {/* Description Box */}
                  <div className="bg-slate-800/50 p-4 rounded-lg mb-6">
                    <h3 className="font-bold mb-2">Attack Details</h3>
                    <p className="text-slate-300 text-sm">
                      This attack simulates real-world image transformations that users might apply.
                      High survival rates indicate robust watermarking. Your watermark survives
                      {selectedAttack.survival_rate > 0.9 ? ' exceptionally well' : selectedAttack.survival_rate > 0.8 ? ' well' : ' reasonably'}{' '}
                      against this attack.
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedAttack(null)}
                    className="button-secondary w-full"
                  >
                    Close Details
                  </motion.button>
                </motion.div>
              </motion.div>
            )}

            {/* Legend */}
            <div className="card-glass p-6 rounded-lg">
              <h3 className="font-bold mb-4">Survival Rate Interpretation</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-20 bg-slate-700 rounded h-3 overflow-hidden">
                    <div className="w-full bg-green-500 h-full"></div>
                  </div>
                  <p className="text-slate-300">
                    <span className="font-bold text-green-400">90-100%</span> - Watermark highly resilient
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-20 bg-slate-700 rounded h-3 overflow-hidden">
                    <div className="w-4/5 bg-yellow-500 h-full"></div>
                  </div>
                  <p className="text-slate-300">
                    <span className="font-bold text-yellow-400">80-89%</span> - Moderate resilience
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-20 bg-slate-700 rounded h-3 overflow-hidden">
                    <div className="w-3/5 bg-red-500 h-full"></div>
                  </div>
                  <p className="text-slate-300">
                    <span className="font-bold text-red-400">&lt;80%</span> - Lower resilience
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!uploadedImage && attackResults.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12"
          >
            <div className="card-glass p-6 rounded-lg">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-bold mb-2">Attack Simulation</h3>
              <p className="text-slate-400 text-sm">
                Test your watermarked images against real-world scenarios like screenshots,
                compression, and filters.
              </p>
            </div>
            <div className="card-glass p-6 rounded-lg">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-bold mb-2">Detailed Metrics</h3>
              <p className="text-slate-400 text-sm">
                Get survival rates for each attack and understand which transformations
                your watermark handles best.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
