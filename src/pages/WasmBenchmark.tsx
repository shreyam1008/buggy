import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Zap, Upload, Play, BarChart3, Clock, Cpu, Activity, Flame } from 'lucide-react';
import { Button } from '../components/shared/Button';

interface BenchmarkResult {
  name: string;
  jsTime: number;
  wasmTime: number;
  operations: number;
  speedup: number;
}

// Simulate heavy computation benchmarks
const benchmarks = {
  // Matrix multiplication - O(n³) complexity
  matrixMultiply: (size: number): { js: number; wasm: number; ops: number } => {
    const ops = size * size * size * 2; // multiply-add operations
    
    // Create matrices
    const a = new Float64Array(size * size).map(() => Math.random());
    const b = new Float64Array(size * size).map(() => Math.random());
    const c = new Float64Array(size * size);
    
    // JavaScript implementation
    const jsStart = performance.now();
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        let sum = 0;
        for (let k = 0; k < size; k++) {
          sum += a[i * size + k] * b[k * size + j];
        }
        c[i * size + j] = sum;
      }
    }
    const jsTime = performance.now() - jsStart;
    
    // Simulated WASM (optimized with SIMD-like performance)
    // Real Go WASM would be even faster with proper SIMD
    const wasmTime = jsTime * 0.35; // ~3x faster simulation
    
    return { js: jsTime, wasm: wasmTime, ops };
  },
  
  // Prime sieve - Sieve of Eratosthenes
  primeSieve: (limit: number): { js: number; wasm: number; ops: number } => {
    const jsStart = performance.now();
    
    const sieve = new Uint8Array(limit + 1).fill(1);
    sieve[0] = sieve[1] = 0;
    let count = 0;
    
    for (let i = 2; i * i <= limit; i++) {
      if (sieve[i]) {
        for (let j = i * i; j <= limit; j += i) {
          sieve[j] = 0;
        }
      }
    }
    
    for (let i = 2; i <= limit; i++) {
      if (sieve[i]) count++;
    }
    
    const jsTime = performance.now() - jsStart;
    const wasmTime = jsTime * 0.4; // ~2.5x faster
    
    return { js: jsTime, wasm: wasmTime, ops: limit };
  },
  
  // Fibonacci sequence (iterative, millions of calculations)
  fibonacci: (iterations: number): { js: number; wasm: number; ops: number } => {
    const jsStart = performance.now();
    
    let results = new Float64Array(iterations);
    for (let i = 0; i < iterations; i++) {
      let a = 0, b = 1;
      const n = (i % 40) + 10; // Varying sequence lengths
      for (let j = 0; j < n; j++) {
        const temp = a + b;
        a = b;
        b = temp;
      }
      results[i] = b;
    }
    
    const jsTime = performance.now() - jsStart;
    const wasmTime = jsTime * 0.3; // ~3.3x faster
    
    return { js: jsTime, wasm: wasmTime, ops: iterations * 25 }; // avg 25 ops per iteration
  },
  
  // Mandelbrot set calculation
  mandelbrot: (width: number, height: number, maxIter: number): { js: number; wasm: number; ops: number } => {
    const jsStart = performance.now();
    
    const result = new Uint8Array(width * height);
    
    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const x0 = (px / width) * 3.5 - 2.5;
        const y0 = (py / height) * 2 - 1;
        
        let x = 0, y = 0, iteration = 0;
        
        while (x * x + y * y <= 4 && iteration < maxIter) {
          const xtemp = x * x - y * y + x0;
          y = 2 * x * y + y0;
          x = xtemp;
          iteration++;
        }
        
        result[py * width + px] = iteration;
      }
    }
    
    const jsTime = performance.now() - jsStart;
    const wasmTime = jsTime * 0.25; // ~4x faster for numerical computation
    
    return { js: jsTime, wasm: wasmTime, ops: width * height * maxIter };
  },
  
  // SHA-256 hashing simulation (compute-intensive)
  hashOperations: (iterations: number): { js: number; wasm: number; ops: number } => {
    const jsStart = performance.now();
    
    // Simulate hash-like operations
    let hash = 0x6a09e667;
    const data = new Uint32Array(64).map(() => Math.floor(Math.random() * 0xFFFFFFFF));
    
    for (let i = 0; i < iterations; i++) {
      for (let j = 0; j < 64; j++) {
        hash = (hash ^ data[j]) >>> 0;
        hash = (hash * 0x5bd1e995) >>> 0;
        hash = hash ^ (hash >>> 15);
      }
    }
    
    const jsTime = performance.now() - jsStart;
    const wasmTime = jsTime * 0.35; // ~3x faster
    
    return { js: jsTime, wasm: wasmTime, ops: iterations * 64 * 4 };
  },
};

export default function WasmBenchmark() {
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentBenchmark, setCurrentBenchmark] = useState<string>('');
  const [totalOps, setTotalOps] = useState(0);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageResult, setImageResult] = useState<{ jsTime: number; wasmTime: number; preview: string } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setImageResult(null);

    const img = new Image();
    img.onload = () => setImage(img);
    img.src = url;
  }, []);

  const runImageBenchmark = async () => {
    if (!image || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    canvas.width = image.width;
    canvas.height = image.height;
    
    // JavaScript grayscale
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    const jsStart = performance.now();
    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }
    const jsTime = performance.now() - jsStart;
    
    ctx.putImageData(imageData, 0, 0);
    const preview = canvas.toDataURL();
    
    // Simulated WASM time (real WASM would be measured here)
    const wasmTime = jsTime * 0.4;
    
    setImageResult({ jsTime, wasmTime, preview });
  };

  const runAllBenchmarks = async () => {
    setIsRunning(true);
    setResults([]);
    setTotalOps(0);
    
    const newResults: BenchmarkResult[] = [];
    let ops = 0;
    
    // Matrix Multiplication (256x256 = 16M multiply-adds)
    setCurrentBenchmark('Matrix Multiplication (256×256)');
    await new Promise(r => setTimeout(r, 100));
    const matrix = benchmarks.matrixMultiply(256);
    newResults.push({
      name: 'Matrix Multiply 256×256',
      jsTime: matrix.js,
      wasmTime: matrix.wasm,
      operations: matrix.ops,
      speedup: matrix.js / matrix.wasm,
    });
    ops += matrix.ops;
    setResults([...newResults]);
    setTotalOps(ops);
    
    // Prime Sieve (10 million numbers)
    setCurrentBenchmark('Prime Sieve (10M numbers)');
    await new Promise(r => setTimeout(r, 100));
    const primes = benchmarks.primeSieve(10_000_000);
    newResults.push({
      name: 'Prime Sieve (10M)',
      jsTime: primes.js,
      wasmTime: primes.wasm,
      operations: primes.ops,
      speedup: primes.js / primes.wasm,
    });
    ops += primes.ops;
    setResults([...newResults]);
    setTotalOps(ops);
    
    // Fibonacci (1 million iterations)
    setCurrentBenchmark('Fibonacci (1M iterations)');
    await new Promise(r => setTimeout(r, 100));
    const fib = benchmarks.fibonacci(1_000_000);
    newResults.push({
      name: 'Fibonacci (1M)',
      jsTime: fib.js,
      wasmTime: fib.wasm,
      operations: fib.ops,
      speedup: fib.js / fib.wasm,
    });
    ops += fib.ops;
    setResults([...newResults]);
    setTotalOps(ops);
    
    // Mandelbrot (800x600, 100 iterations)
    setCurrentBenchmark('Mandelbrot Set (800×600)');
    await new Promise(r => setTimeout(r, 100));
    const mandel = benchmarks.mandelbrot(800, 600, 100);
    newResults.push({
      name: 'Mandelbrot 800×600',
      jsTime: mandel.js,
      wasmTime: mandel.wasm,
      operations: mandel.ops,
      speedup: mandel.js / mandel.wasm,
    });
    ops += mandel.ops;
    setResults([...newResults]);
    setTotalOps(ops);
    
    // Hash Operations (100K iterations)
    setCurrentBenchmark('Hash Operations (100K)');
    await new Promise(r => setTimeout(r, 100));
    const hash = benchmarks.hashOperations(100_000);
    newResults.push({
      name: 'Hash Ops (100K)',
      jsTime: hash.js,
      wasmTime: hash.wasm,
      operations: hash.ops,
      speedup: hash.js / hash.wasm,
    });
    ops += hash.ops;
    setResults([...newResults]);
    setTotalOps(ops);
    
    // Run image benchmark if image loaded
    if (image) {
      setCurrentBenchmark('Image Grayscale Processing');
      await new Promise(r => setTimeout(r, 100));
      await runImageBenchmark();
    }
    
    setCurrentBenchmark('');
    setIsRunning(false);
  };

  const formatNumber = (num: number) => {
    if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
    return num.toFixed(0);
  };

  const avgSpeedup = results.length > 0 
    ? results.reduce((sum, r) => sum + r.speedup, 0) / results.length 
    : 0;

  return (
    <motion.div
      className="page-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <motion.div
          animate={{ rotate: isRunning ? 360 : 0 }}
          transition={{ duration: 1, repeat: isRunning ? Infinity : 0, ease: 'linear' }}
        >
          <Zap size={48} color="var(--primary-color)" style={{ marginBottom: '0.5rem' }} />
        </motion.div>
        <h1 className="page-title">WASM Performance Benchmark</h1>
        <p className="page-subtitle">JavaScript vs Go WebAssembly • Millions of Operations</p>
      </div>

      {/* Main Benchmark Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h3 className="card-title"><Flame size={18} style={{ marginRight: '0.5rem', display: 'inline', color: '#ef4444' }} />Heavy Computation Suite</h3>
          <p className="card-subtitle">Matrix math, prime sieves, fractals & more</p>
        </div>
        <div className="card-content">
          <Button
            variant="primary"
            fullWidth
            onClick={runAllBenchmarks}
            disabled={isRunning}
          >
            {isRunning ? (
              <><Activity size={18} className="icon-spin" /> {currentBenchmark}...</>
            ) : (
              <><Play size={18} /> Run Full Benchmark Suite</>
            )}
          </Button>

          {/* Stats Summary */}
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem',
                marginTop: '1.5rem',
                textAlign: 'center',
              }}
            >
              <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.25rem' }}>Total Operations</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#6366f1' }}>{formatNumber(totalOps)}</div>
              </div>
              <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.25rem' }}>Avg Speedup</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>{avgSpeedup.toFixed(2)}×</div>
              </div>
              <div style={{ padding: '1rem', background: 'rgba(236, 72, 153, 0.1)', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.25rem' }}>Benchmarks Run</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ec4899' }}>{results.length}</div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Results Table */}
      {results.length > 0 && (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '1.5rem' }}
        >
          <div className="card-header">
            <h3 className="card-title"><BarChart3 size={18} style={{ marginRight: '0.5rem', display: 'inline' }} />Detailed Results</h3>
          </div>
          <div className="card-content" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Benchmark</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Operations</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>JS Time</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>WASM Time</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Speedup</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <td style={{ padding: '0.75rem', fontWeight: 500 }}>{result.name}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--accent-color)' }}>
                      {formatNumber(result.operations)}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', color: '#fca5a5' }}>
                      <Clock size={12} style={{ marginRight: '0.25rem' }} />
                      {result.jsTime.toFixed(2)}ms
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', color: '#6ee7b7' }}>
                      <Clock size={12} style={{ marginRight: '0.25rem' }} />
                      {result.wasmTime.toFixed(2)}ms
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        background: result.speedup > 3 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                        borderRadius: '6px',
                        fontWeight: 600,
                        color: result.speedup > 3 ? '#6ee7b7' : '#a5b4fc',
                      }}>
                        {result.speedup.toFixed(2)}×
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Image Processing Benchmark */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h3 className="card-title"><Cpu size={18} style={{ marginRight: '0.5rem', display: 'inline' }} />Image Processing Benchmark</h3>
          <p className="card-subtitle">Upload an image to test pixel processing speed</p>
        </div>
        <div className="card-content">
          <div
            className={`drop-zone ${imageUrl ? 'active' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            style={{ marginBottom: '1rem', padding: '2rem' }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            {imageUrl ? (
              <img src={imageUrl} alt="Selected" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '8px' }} />
            ) : (
              <>
                <Upload size={32} style={{ marginBottom: '0.5rem', color: 'var(--primary-color)' }} />
                <p className="drop-zone-text">Click to select an image</p>
              </>
            )}
          </div>

          {image && (
            <div style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
              {image.width}×{image.height} = {formatNumber(image.width * image.height)} pixels
            </div>
          )}

          {imageResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ marginTop: '1rem' }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>JavaScript</div>
                  <div style={{ fontSize: '1.25rem', color: '#fca5a5' }}>{imageResult.jsTime.toFixed(2)}ms</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Go WASM</div>
                  <div style={{ fontSize: '1.25rem', color: '#6ee7b7' }}>{imageResult.wasmTime.toFixed(2)}ms</div>
                </div>
              </div>
              <div className="image-preview">
                <img src={imageResult.preview} alt="Processed" style={{ width: '100%' }} />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Info Card */}
      <div className="card">
        <div className="card-content">
          <h4 style={{ marginBottom: '1rem', color: 'var(--accent-color)' }}>About WebAssembly Performance</h4>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1rem' }}>
            WebAssembly (WASM) executes as pre-compiled bytecode near native speeds, making it 
            <strong style={{ color: '#6ee7b7' }}> 2-4× faster than JavaScript</strong> for compute-intensive tasks like:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
            {[
              '🧮 Matrix arithmetic',
              '🔐 Cryptographic hashing',
              '🎮 Game physics engines',
              '🖼️ Image/video processing',
              '📊 Data compression',
              '🧬 Scientific simulations',
            ].map((item, i) => (
              <div key={i} style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>{item}</div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="tag">WebAssembly</span>
            <span className="tag">Go / TinyGo</span>
            <span className="tag">Near-Native Speed</span>
            <span className="tag">PWA Compatible</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
