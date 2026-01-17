'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface AttackConfig {
  name: string;
  type: string;
  severity: number;
}

interface AttackResult {
  name: string;
  type: string;
  severity: number;
  detected: boolean;
  confidence: number;
}

export default function PipelinePage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [stampedImage, setStampedImage] = useState<string | null>(null);
  const [attackResults, setAttackResults] = useState<AttackResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentAttack, setCurrentAttack] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [predefinedAttacks, setPredefinedAttacks] = useState<AttackConfig[]>([]);
  const [strength, setStrength] = useState<number>(0.7);
  const [adaptive, setAdaptive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch predefined attacks on mount
  useEffect(() => {
    const fetchAttacks = async () => {
      try {
        const apiUrl = typeof window !== 'undefined'
          ? `http://${window.location.hostname}:8000`
          : 'http://localhost:8000';
        
        const response = await fetch(`${apiUrl}/api/attacks`);
        if (response.ok) {
          const data = await response.json();
          setPredefinedAttacks(data.attacks);
        }
      } catch (err) {
        console.error('Error fetching attacks:', err);
      }
    };
    
    fetchAttacks();
  }, []);

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

    // Clear all previous state before processing
    setStampedImage(null);
    setAttackResults([]);
    setError(null);
    setCurrentAttack('');
    
    // Display uploaded image
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // First, stamp the image
    setLoading(true);
    setCurrentAttack('Stamping image...');

    try {
      const apiUrl = typeof window !== 'undefined'
        ? `http://${window.location.hostname}:8000`
        : 'http://localhost:8000';

      const formData = new FormData();
      formData.append('file', file);

      // Call /api/stamp to add watermark with strength and adaptive settings
      const stampResponse = await fetch(
        `${apiUrl}/api/stamp?strength=${strength}&adaptive=${adaptive}`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!stampResponse.ok) {
        throw new Error('Failed to stamp image');
      }

      const stampData = await stampResponse.json();
      setStampedImage(`data:image/png;base64,${stampData.stamped_image}`);

      // Now run attacks on the stamped image
      setCurrentAttack('Running attacks...');

      const results: AttackResult[] = [];

      for (const attack of predefinedAttacks) {
        setCurrentAttack(`Running: ${attack.name}...`);

        try {
          // Convert base64 stamped image back to file for attack
          const response = await fetch(`data:image/png;base64,${stampData.stamped_image}`);
          const blob = await response.blob();
          const attackFormData = new FormData();
          attackFormData.append('file', blob, 'stamped.png');

          // Call /api/attack
          const attackResponse = await fetch(
            `${apiUrl}/api/attack?attack_type=${attack.type}&severity=${attack.severity}`,
            {
              method: 'POST',
              body: attackFormData,
            }
          );

          if (!attackResponse.ok) {
            throw new Error(`Attack failed: ${attack.name}`);
          }

          const attackData = await attackResponse.json();

          results.push({
            name: attack.name,
            type: attack.type,
            severity: attack.severity,
            detected: attackData.detected,
            confidence: attackData.confidence,
          });
        } catch (err) {
          console.error(`Error running attack ${attack.name}:`, err);
          results.push({
            name: attack.name,
            type: attack.type,
            severity: attack.severity,
            detected: false,
            confidence: 0,
          });
        }
      }

      setAttackResults(results);
      setCurrentAttack('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error processing image');
      setCurrentAttack('');
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
    // Reset input value so same file can be selected again
    e.target.value = '';
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const robustnessScore =
    attackResults.length > 0
      ? ((attackResults.filter((r) => r.detected).length / attackResults.length) * 100).toFixed(1)
      : 0;

  const detectedCount = attackResults.filter((r) => r.detected).length;

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
          Upload any image → We stamp it → Run 20 attacks → Test watermark survival
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
            <div className="text-5xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold mb-2">Upload Any Image</h2>
            <p className="text-slate-400 mb-4">
              We'll stamp it with a watermark, then run 20 attacks to test robustness
            </p>
            <p className="text-sm text-slate-500">
              Drag and drop or click to browse • PNG, JPEG, WebP, GIF
            </p>
          </div>
        </motion.div>

        {/* Watermark Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-glass p-6 rounded-xl mb-8"
        >
          <h3 className="text-lg font-semibold mb-4 text-purple-400">⚙️ Watermark Settings</h3>
          
          {/* Strength Slider */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-slate-300">
                Strength: {(strength * 100).toFixed(0)}%
              </label>
              <span className="text-xs text-slate-400">
                {strength <= 0.3 ? '🟢 Minimal artifacts' : strength <= 0.6 ? '🟡 Balanced' : '🔴 Maximum robustness'}
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={strength}
              onChange={(e) => setStrength(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500 
                [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg
                [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full 
                [&::-moz-range-thumb]:bg-purple-500 [&::-moz-range-thumb]:cursor-pointer 
                [&::-moz-range-thumb]:border-0"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Low (10%)</span>
              <span>Medium (50%)</span>
              <span>High (100%)</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Lower strength = less visible artifacts, but may be less robust to attacks
            </p>
          </div>

          {/* Adaptive Masking Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-slate-300">Adaptive Masking</label>
              <p className="text-xs text-slate-400 mt-1">
                Reduces watermark in flat areas to minimize visible artifacts
              </p>
            </div>
            <button
              onClick={() => setAdaptive(!adaptive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                adaptive ? 'bg-purple-600' : 'bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  adaptive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
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
            className="text-center py-12 mb-8"
          >
            <div className="text-4xl mb-4">⚡</div>
            <p className="text-xl text-slate-300 mb-2">{currentAttack || 'Processing...'}</p>
            <p className="text-sm text-slate-400">
              Strength: {(strength * 100).toFixed(0)}% | Adaptive: {adaptive ? 'ON' : 'OFF'}
            </p>
          </motion.div>
        )}

        {/* Results Section */}
        {attackResults.length > 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Settings Banner */}
            <div className="card-glass p-4 rounded-lg bg-purple-900/20 border border-purple-500/30">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">
                  <span className="font-semibold text-purple-400">Test Settings:</span> Strength {(strength * 100).toFixed(0)}% | Adaptive Masking {adaptive ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card-glass p-6 rounded-lg">
                <div className="text-3xl font-bold text-blue-400">{robustnessScore}%</div>
                <div className="text-sm text-slate-400 mt-1">Watermark Robustness</div>
              </div>
              <div className="card-glass p-6 rounded-lg">
                <div className="text-3xl font-bold text-green-400">{detectedCount}</div>
                <div className="text-sm text-slate-400 mt-1">
                  Attacks Survived (of {attackResults.length})
                </div>
              </div>
              <div className="card-glass p-6 rounded-lg">
                <div className="text-3xl font-bold text-purple-400">
                  {(
                    attackResults.reduce((sum, r) => sum + r.confidence, 0) /
                    attackResults.length
                  ).toFixed(2)}
                </div>
                <div className="text-sm text-slate-400 mt-1">Avg Confidence</div>
              </div>
            </div>

            {/* Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {uploadedImage && (
                <div className="card-glass p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-slate-300">Original Image</h3>
                  <img
                    src={uploadedImage}
                    alt="Original"
                    className="w-full rounded-lg max-h-64 object-cover"
                  />
                </div>
              )}
              {stampedImage && (
                <div className="card-glass p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-slate-300">Stamped Image</h3>
                  <img
                    src={stampedImage}
                    alt="Stamped"
                    className="w-full rounded-lg max-h-64 object-cover"
                  />
                </div>
              )}
            </div>

            {/* Attack Results Table */}
            <div className="card-glass p-6 rounded-lg overflow-x-auto">
              <h3 className="text-lg font-semibold mb-4 text-slate-300">Attack Results</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-400">Attack</th>
                    <th className="text-left py-3 px-4 text-slate-400">Detected</th>
                    <th className="text-left py-3 px-4 text-slate-400">Confidence</th>
                    <th className="text-left py-3 px-4 text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attackResults.map((result, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors"
                    >
                      <td className="py-3 px-4 text-slate-300">{result.name}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded text-xs font-semibold ${
                            result.detected
                              ? 'bg-green-900/50 text-green-300'
                              : 'bg-red-900/50 text-red-300'
                          }`}
                        >
                          {result.detected ? '✓ Yes' : '✗ No'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {(result.confidence * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 px-4">
                        {result.detected ? (
                          <span className="text-green-400">Survived ✓</span>
                        ) : (
                          <span className="text-red-400">Broken ✗</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Robustness Bar Chart */}
            <div className="card-glass p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-slate-300">Robustness by Attack Type</h3>
              <div className="space-y-3">
                {['jpeg', 'resize', 'crop', 'blur', 'noise', 'rotate', 'brightness', 'format'].map(
                  (type) => {
                    const typeResults = attackResults.filter((r) => r.type === type);
                    const survivalPct =
                      typeResults.length > 0
                        ? ((typeResults.filter((r) => r.detected).length / typeResults.length) *
                            100) | 0
                        : 0;
                    return (
                      <div key={type}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-slate-400 capitalize">{type}</span>
                          <span className="text-sm font-semibold text-slate-300">
                            {survivalPct}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${survivalPct}%` }}
                            transition={{ duration: 0.5 }}
                            className={`h-2 rounded-full ${
                              survivalPct >= 80
                                ? 'bg-green-500'
                                : survivalPct >= 50
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
