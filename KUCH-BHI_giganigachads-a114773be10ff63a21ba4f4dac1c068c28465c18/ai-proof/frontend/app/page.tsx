'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 text-center max-w-4xl mx-auto"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Logo / Title */}
        <motion.div variants={item} className="mb-8">
          <motion.h1
            className="text-6xl md:text-7xl font-bold mb-4 gradient-text"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            AI-PROOF
          </motion.h1>
          <p className="text-xl text-slate-400">
            Detect AI-Generated Images with Invisible Watermarks
          </p>
        </motion.div>

        {/* Description */}
        <motion.p
          variants={item}
          className="text-lg text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          Use StegaStamp invisible watermarks to authenticate images and detect AI-generated content. Embed watermarks imperceptibly and detect them with high precision.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          variants={item}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          {/* Generate & Stamp Button */}
          <Link href="/generate">
            <motion.div
              className="card-glass p-8 rounded-xl cursor-pointer hover:border-blue-400 transition-all"
              whileHover={{ scale: 1.05, y: -10 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-4xl mb-4">🖼️</div>
              <h2 className="text-2xl font-bold mb-3 text-blue-400">Generate & Stamp</h2>
              <p className="text-slate-300 text-sm">
                Upload an image and embed an invisible watermark to prove authenticity.
              </p>
              <div className="mt-6 button-primary inline-block">
                Get Started →
              </div>
            </motion.div>
          </Link>

          {/* Screenshot Test Button */}
          <Link href="/pipeline">
            <motion.div
              className="card-glass p-8 rounded-xl cursor-pointer hover:border-purple-400 transition-all"
              whileHover={{ scale: 1.05, y: -10 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-4xl mb-4">📸</div>
              <h2 className="text-2xl font-bold mb-3 text-purple-400">Pipeline Test</h2>
              <p className="text-slate-300 text-sm">
                Simulate attacks like screenshots, crops, and filters to test watermark resilience.
              </p>
              <div className="mt-6 button-primary inline-block">
                Test Attacks →
              </div>
            </motion.div>
          </Link>

          {/* Upload Detector Button */}
          <Link href="/detect">
            <motion.div
              className="card-glass p-8 rounded-xl cursor-pointer hover:border-pink-400 transition-all"
              whileHover={{ scale: 1.05, y: -10 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-4xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold mb-3 text-pink-400">Upload Detector</h2>
              <p className="text-slate-300 text-sm">
                Upload any image and detect if it contains the AI-PROOF watermark.
              </p>
              <div className="mt-6 button-primary inline-block">
                Detect Now →
              </div>
            </motion.div>
          </Link>
        </motion.div>

        {/* Features */}
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-20">
          <div className="card-glass p-6 rounded-lg text-left">
            <h3 className="text-xl font-bold mb-2 text-blue-400">⚡ Invisible Watermarks</h3>
            <p className="text-slate-300 text-sm">
              Embed imperceptible watermarks using advanced steganography techniques.
            </p>
          </div>
          <div className="card-glass p-6 rounded-lg text-left">
            <h3 className="text-xl font-bold mb-2 text-purple-400">🛡️ High Accuracy</h3>
            <p className="text-slate-300 text-sm">
              Detect watermarks with high confidence using machine learning models.
            </p>
          </div>
          <div className="card-glass p-6 rounded-lg text-left">
            <h3 className="text-xl font-bold mb-2 text-pink-400">🎯 Resilient Detection</h3>
            <p className="text-slate-300 text-sm">
              Watermarks survive common image attacks like compression and cropping.
            </p>
          </div>
          <div className="card-glass p-6 rounded-lg text-left">
            <h3 className="text-xl font-bold mb-2 text-emerald-400">📊 Frequency Analysis</h3>
            <p className="text-slate-300 text-sm">
              Visualize frequency domain heatmaps to understand watermark patterns.
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div variants={item} className="mt-20 text-slate-500 text-sm">
          <p>AI-PROOF Hackathon | StegaStamp Detection System</p>
        </motion.div>
      </motion.div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </main>
  );
}
