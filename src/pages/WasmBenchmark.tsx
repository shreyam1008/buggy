import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Flame, FlaskConical, Database, Cpu, 
  Layers, Server, Shield, Zap, Clock, Hash, Loader2, Crown, Trophy
} from 'lucide-react';
import { Button } from '../components/shared/Button';
import { useWasm } from '../hooks/useWasm';
import { jsBenchmarks } from '../wasm/jsBenchmarks';
// Rust commented out for now - will add when ready
// import { initRustWasm, rustBenchmarks } from '../wasm/rustBenchmarks';

interface BenchmarkResult {
  name: string;
  category: 'Math & CPU' | 'Crypto' | 'Memory & Data' | 'Graphics' | 'System & Network';
  jsTime: number;
  goTime: number;
  operations: number;
  winner: 'js' | 'go';
  isFairTest: boolean;
}

// Map logical names to actual implementations
const benchmarkMap: Record<string, {go: string, js: keyof typeof jsBenchmarks, ops: number, fair: boolean}> = {
  'Matrix Multiply': { go: 'go_matrixMultiply', js: 'matrixMultiply', ops: 2e6, fair: true },
  'Prime Sieve': { go: 'go_primeSieve', js: 'primeSieve', ops: 5e5, fair: true },
  'Fibonacci': { go: 'go_fibonacci', js: 'fibonacci', ops: 1e6, fair: true },
  'Monte Carlo': { go: 'go_monteCarloPi', js: 'monteCarloPi', ops: 1e7, fair: true },
  'N-Body Sim': { go: 'go_nBody', js: 'nBody', ops: 5e5, fair: true },
  'Mandelbrot': { go: 'go_mandelbrot', js: 'mandelbrot', ops: 2e6, fair: true },
  'SHA-256': { go: 'go_sha256', js: 'sha256', ops: 5e5, fair: false }, 
  'AES Encrypt': { go: 'go_aesEncrypt', js: 'aesEncrypt', ops: 1e6, fair: false },
  'JSON Parse': { go: 'go_jsonParse', js: 'jsonParse', ops: 2e6, fair: false },
  'QuickSort': { go: 'go_quickSort', js: 'quickSort', ops: 1e5, fair: false },
  'BubbleSort': { go: 'go_bubbleSort', js: 'bubbleSort', ops: 5e4, fair: true },
  'Ray Trace': { go: 'go_rayTrace', js: 'rayTrace', ops: 1e6, fair: true },
  'Compression': { go: 'go_compression', js: 'zipCompression', ops: 2e7, fair: false },
};

const COLORS = {
  js: { primary: '#f0db4f', bg: 'rgba(240, 219, 79, 0.2)', name: 'JavaScript' },
  go: { primary: '#00add8', bg: 'rgba(0, 173, 216, 0.2)', name: 'Go WASM' }
};

type Phase = 'idle' | 'js' | 'go' | 'done';

export default function WasmBenchmark() {
  const { isLoaded: isGoLoaded, error: goError } = useWasm();
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState({ js: 0, go: 0 });
  const [currentTest, setCurrentTest] = useState('');
  const [wins, setWins] = useState({ js: 0, go: 0 });

  // Stored times for comparison after both complete
  const [jsTimes, setJsTimes] = useState<number[]>([]);
  const [goTimes, setGoTimes] = useState<number[]>([]);

  const runSequentialBenchmark = async () => {
    if (!isGoLoaded) return;
    setIsRunning(true);
    setResults([]);
    setProgress({ js: 0, go: 0 });
    setWins({ js: 0, go: 0 });
    setJsTimes([]);
    setGoTimes([]);
    
    // Create 50 test suites from the core benchmarks
    const coreTests = Object.keys(benchmarkMap);
    const suites = [];
    
    for (let i = 0; i < 50; i++) {
      const coreKey = coreTests[i % coreTests.length];
      suites.push({
        name: i < coreTests.length ? coreKey : `${coreKey} ${Math.floor(i / coreTests.length) + 1}`, 
        impl: benchmarkMap[coreKey],
        cat: getCategory(coreKey)
      });
    }

    // ========== PHASE 1: JavaScript runs all 50 ==========
    setPhase('js');
    const jsTimesArray: number[] = [];
    
    for (let i = 0; i < suites.length; i++) {
      const suite = suites[i];
      setCurrentTest(`JS: ${suite.name}`);
      await new Promise(r => setTimeout(r, 5)); // Let UI update
      
      const jsFn = jsBenchmarks[suite.impl.js];
      const t0 = performance.now();
      if (jsFn) await jsFn();
      const jsTime = performance.now() - t0;
      
      jsTimesArray.push(jsTime);
      setProgress(p => ({ ...p, js: ((i + 1) / suites.length) * 100 }));
    }
    setJsTimes(jsTimesArray);

    // ========== PHASE 2: Go WASM runs all 50 ==========
    setPhase('go');
    const goTimesArray: number[] = [];
    
    for (let i = 0; i < suites.length; i++) {
      const suite = suites[i];
      setCurrentTest(`Go: ${suite.name}`);
      await new Promise(r => setTimeout(r, 5)); // Let UI update
      
      const goFnName = suite.impl.go;
      const t0 = performance.now();
      if ((window as any)[goFnName]) {
        (window as any)[goFnName]();
      }
      const goTime = performance.now() - t0;
      
      goTimesArray.push(goTime);
      setProgress(p => ({ ...p, go: ((i + 1) / suites.length) * 100 }));
    }
    setGoTimes(goTimesArray);

    // ========== PHASE 3: Calculate winners and build results ==========
    setPhase('done');
    const newResults: BenchmarkResult[] = [];
    const winCount = { js: 0, go: 0 };

    for (let i = 0; i < suites.length; i++) {
      const suite = suites[i];
      const jsTime = jsTimesArray[i];
      const goTime = goTimesArray[i];
      const winner: 'js' | 'go' = jsTime <= goTime ? 'js' : 'go';
      winCount[winner]++;

      newResults.push({
        name: suite.name,
        category: suite.cat as BenchmarkResult['category'],
        jsTime,
        goTime,
        operations: suite.impl.ops,
        winner,
        isFairTest: suite.impl.fair
      });
    }

    setResults(newResults);
    setWins(winCount);
    setIsRunning(false);
    setCurrentTest('🏁 Race Complete!');
  };

  const getCategory = (name: string): string => {
    const n = name.toLowerCase();
    if (['matrix', 'prime', 'fib', 'monte', 'n-body', 'mandel'].some(k => n.includes(k))) return 'Math & CPU';
    if (['sha', 'aes'].some(k => n.includes(k))) return 'Crypto';
    if (['json', 'sort', 'bubble'].some(k => n.includes(k))) return 'Memory & Data';
    if (['ray'].some(k => n.includes(k))) return 'Graphics';
    return 'System & Network'; 
  };

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toFixed(0);
  };

  const categories = ['Math & CPU', 'Crypto', 'Memory & Data', 'Graphics', 'System & Network'];

  const ProgressBar = ({ label, color, value, isActive, icon }: { label: string, color: string, value: number, isActive: boolean, icon: React.ReactNode }) => (
    <div style={{ opacity: isActive ? 1 : 0.5 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px', color }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {icon} {label} {isActive && <Loader2 size={12} className="animate-spin" style={{ marginLeft: '4px' }} />}
        </div>
        <span>{Math.round(value)}%</span>
      </div>
      <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
        <motion.div 
          style={{ height: '100%', background: color, borderRadius: '4px' }}
          initial={{ width: 0 }} 
          animate={{ width: `${value}%` }} 
          transition={{ ease: "easeOut", duration: 0.3 }} 
        />
      </div>
    </div>
  );

  const WinnerBadge = ({ winner }: { winner: 'js' | 'go' }) => (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '4px',
      padding: '4px 10px', 
      borderRadius: '12px', 
      background: COLORS[winner].bg,
      color: COLORS[winner].primary,
      fontSize: '0.75rem',
      fontWeight: 700
    }}>
      <Crown size={12} />
      {COLORS[winner].name}
    </div>
  );

  return (
    <motion.div
      className="page-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <motion.div
          animate={{ rotate: isRunning ? 360 : 0, scale: isRunning ? 1.2 : 1 }}
          transition={{ duration: 0.5, repeat: isRunning ? Infinity : 0, ease: 'linear' }}
        >
          <Flame size={48} color="#ef4444" style={{ marginBottom: '0.5rem', filter: 'drop-shadow(0 0 10px #ef4444)' }} />
        </motion.div>
        <h1 className="page-title">WASM Battle Arena</h1>
        <p className="page-subtitle">JavaScript vs Go WASM • 50-Suite Sequential Race</p>
      </div>

      {/* Win Summary */}
      {results.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }}
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '1rem', 
            marginBottom: '1.5rem' 
          }}
        >
          {(['js', 'go'] as const).map(lang => (
            <div 
              key={lang}
              className="glass-card" 
              style={{ 
                padding: '1.2rem', 
                textAlign: 'center',
                border: wins[lang] > wins[lang === 'js' ? 'go' : 'js'] ? `2px solid ${COLORS[lang].primary}` : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                {wins[lang] > wins[lang === 'js' ? 'go' : 'js'] && (
                  <Trophy size={24} color={COLORS[lang].primary} />
                )}
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: COLORS[lang].primary }}>
                {wins[lang]}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
                {COLORS[lang].name} Wins
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Control Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h3 className="card-title">
            <Activity size={18} style={{ marginRight: '0.5rem', display: 'inline' }} />
            Sequential Race Mode
          </h3>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
            {phase === 'idle' && (isGoLoaded ? 'Ready to Race' : 'Loading Go WASM...')}
            {phase === 'js' && '🟡 JavaScript Racing...'}
            {phase === 'go' && '🔵 Go WASM Racing...'}
            {phase === 'done' && '🏁 Race Complete!'}
          </div>
        </div>
        <div className="card-content">
          {/* Loading State */}
          {!isGoLoaded && !goError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', color: 'rgba(255,255,255,0.5)' }}>
              <Loader2 size={16} className="animate-spin" />
              Loading Go WASM Engine...
            </div>
          )}

          {goError && <div style={{ color: 'red', marginBottom: '1rem' }}>Go WASM Error: {goError}</div>}

          {/* Progress Bars - Sequential Racing */}
          {isRunning && (
            <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <ProgressBar 
                label="JavaScript (V8)" 
                color={COLORS.js.primary} 
                value={progress.js}
                isActive={phase === 'js'}
                icon={<Zap size={14} />}
              />
              <ProgressBar 
                label="Go WASM" 
                color={COLORS.go.primary} 
                value={progress.go}
                isActive={phase === 'go'}
                icon={<Cpu size={14} />}
              />
            </div>
          )}

          {/* Current Test Indicator */}
          {isRunning && (
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '1rem', 
              fontFamily: 'monospace', 
              fontSize: '0.9rem',
              color: phase === 'js' ? COLORS.js.primary : COLORS.go.primary
            }}>
              ⚡ {currentTest}
            </div>
          )}

          <Button fullWidth onClick={runSequentialBenchmark} disabled={isRunning || !isGoLoaded} variant="primary">
            {isRunning ? 'Racing in Progress...' : '🏁 START RACE'}
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Clock size={14} /> <span>Time in <strong>ms</strong> (Lower = Faster)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Hash size={14} /> <span><strong>Ops</strong> = Operations per test</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Crown size={14} /> <span>Winner per test</span>
        </div>
      </div>

      {/* Categorized Results */}
      <AnimatePresence>
        {results.length > 0 && categories.map(cat => {
          const catResults = results.filter(r => r.category === cat);
          if (catResults.length === 0) return null;

          return (
            <motion.div 
              key={cat} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              style={{ marginBottom: '2rem' }}
            >
              <h3 style={{ 
                fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', 
                display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff',
                borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem'
              }}>
                {cat === 'Math & CPU' && <FlaskConical size={20} color="#818cf8"/>}
                {cat === 'Crypto' && <Shield size={20} color="#f472b6"/>}
                {cat === 'Memory & Data' && <Database size={20} color="#60a5fa"/>}
                {cat === 'Graphics' && <Layers size={20} color="#a78bfa"/>}
                {cat === 'System & Network' && <Server size={20} color="#fb923c"/>}
                {cat}
                {catResults.some(r => !r.isFairTest) && (
                  <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginLeft: '0.5rem' }}>
                    (⚠️ Some use native APIs)
                  </span>
                )}
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {catResults.map((res, i) => (
                  <div key={i} className="glass-card" style={{ padding: '1rem', position: 'relative', overflow: 'hidden' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {res.name}
                          {!res.isFairTest && <span title="Uses native APIs" style={{ fontSize: '0.7rem', opacity: 0.5 }}>⚠️</span>}
                        </h4>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>{formatNumber(res.operations)} Ops</div>
                      </div>
                      <WinnerBadge winner={res.winner} />
                    </div>

                    {/* 2-Way Comparison */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {/* JavaScript */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <div style={{ padding: '3px', background: COLORS.js.bg, borderRadius: '4px' }}>
                            <Zap size={12} color={COLORS.js.primary} />
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>JS</span>
                        </div>
                        <div style={{ 
                          fontSize: '0.85rem', 
                          fontFamily: 'monospace', 
                          color: COLORS.js.primary,
                          fontWeight: res.winner === 'js' ? 700 : 400
                        }}>
                          {res.jsTime.toFixed(2)}ms
                          {res.winner === 'js' && ' 🏆'}
                        </div>
                      </div>
                      
                      {/* Go */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <div style={{ padding: '3px', background: COLORS.go.bg, borderRadius: '4px' }}>
                            <Cpu size={12} color={COLORS.go.primary} /> 
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>Go</span>
                        </div>
                        <div style={{ 
                          fontSize: '0.85rem', 
                          fontFamily: 'monospace', 
                          color: COLORS.go.primary,
                          fontWeight: res.winner === 'go' ? 700 : 400
                        }}>
                          {res.goTime.toFixed(2)}ms
                          {res.winner === 'go' && ' 🏆'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Winner bar */}
                    <div style={{
                      position: 'absolute', top: 0, right: 0, bottom: 0, width: '4px',
                      background: COLORS[res.winner].primary
                    }}/>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
      
      {/* SEO Tags */}
      <div style={{ marginTop: '3rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', opacity: 0.5, justifyContent: 'center' }}>
        {['WebAssembly', 'Go WASM', 'JavaScript', 'Performance', 'Benchmark', 'V8 Engine'].map(tag => (
          <span key={tag} style={{ fontSize: '0.7rem', padding: '2px 6px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}>#{tag}</span>
        ))}
      </div>
    </motion.div>
  );
}
