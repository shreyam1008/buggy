import { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, MousePointer2 } from 'lucide-react';

// Lazy load the 3D scene to avoid bloating the main bundle
const Scene = lazy(() => import('../components/3d/Scene'));

export default function ThreeDShowcase() {
  return (
    <motion.div
      className="page-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles size={48} color="var(--primary-color)" />
        </motion.div>
        <h1 className="page-title">Cosmic Galaxy</h1>
        <p className="page-subtitle">Interactive 3D Particle System • Radha Krishna Theme</p>
      </div>

      {/* 3D Canvas Container */}
      <div className="card" style={{ marginBottom: '1.5rem', overflow: 'hidden', padding: 0, background: '#050510' }}>
        <div style={{ position: 'relative', height: '600px' }}>
          
          {/* Loading State */}
          <div style={{ 
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 0, color: 'rgba(255,255,255,0.5)', pointerEvents: 'none' 
          }}>
            <div className="loading-spinner" />
          </div>

          <Suspense fallback={null}>
            <Scene />
          </Suspense>

          {/* Overlay Hint */}
          <div style={{
            position: 'absolute', bottom: '20px', left: '0', right: '0',
            textAlign: 'center', pointerEvents: 'none'
          }}>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2 }}
              style={{ 
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(0,0,0,0.5)', padding: '8px 16px', borderRadius: '20px',
                backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <MousePointer2 size={14} color="#a5b4fc" />
              <span style={{ fontSize: '0.8rem', color: '#e0e7ff' }}>Drag to rotate • Scroll to zoom</span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Tech Info */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h3 className="card-title"><Zap size={18} style={{ marginRight: '0.5rem', display: 'inline' }} />Showcase Technology</h3>
        </div>
        <div className="card-content">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {[
              { name: 'React Three Fiber', desc: 'Declarative Three.js for React', status: 'Core' },
              { name: 'Procedural Particles', desc: '20,000+ individual points calculated on CPU', status: 'Visuals' },
              { name: 'Buffer Geometry', desc: 'High-performance GPU rendering', status: 'Performance' },
              { name: 'Post-processing', desc: 'Bloom and color grading (simulated)', status: 'Effects' },
            ].map((tech, i) => (
              <motion.div
                key={i}
                style={{
                  padding: '1rem',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '12px',
                }}
                whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.05)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4 style={{ color: 'white', fontSize: '0.95rem' }}>{tech.name}</h4>
                  <span className="tag" style={{ 
                    background: 'rgba(99, 102, 241, 0.2)',
                    color: '#a5b4fc',
                    fontSize: '0.7rem',
                  }}>
                    {tech.status}
                  </span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>{tech.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
    </motion.div>
  );
}
