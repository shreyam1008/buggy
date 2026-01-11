import { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, MousePointer2, Move3d } from 'lucide-react';

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

      {/* Performance Analysis */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h3 className="card-title"><Zap size={18} style={{ marginRight: '0.5rem', display: 'inline' }} />Under the Hood: CPU vs GPU</h3>
        </div>
        <div className="card-content">
          
          <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <h4 style={{ color: '#6ee7b7', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="pulsing-dot" style={{ width: 8, height: 8, background: '#6ee7b7', borderRadius: '50%', display: 'inline-block' }} />
              Live Stats Enabled
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
              Check the <strong>FPS counter</strong> in the top-left of the galaxy view. 
              <br/>
              <strong>60 FPS</strong> = Butter Smooth (GPU handling the load).
            </p>
          </div>

          <div className="comparison-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* CPU Column */}
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.2)' }}>
                  <Move3d size={20} color="#818cf8" />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>CPU (The Brain)</h4>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>JavaScript Main Thread</span>
                </div>
              </div>
              <ul style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li>Calculates <strong>20,000 positions</strong> ONCE on load (Math.sin/cos).</li>
                <li>Updates scene time every frame.</li>
                <li><strong>Load:</strong> Very Low (~1-2%).</li>
                <li><strong>Role:</strong> "The Architect" - Plans the structure.</li>
              </ul>
            </div>

            {/* GPU Column */}
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(236, 72, 153, 0.2)' }}>
                  <Sparkles size={20} color="#f472b6" />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>GPU (The Muscle)</h4>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>WebGL / Graphics Card</span>
                </div>
              </div>
              <ul style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li>Draws <strong>20,000 points</strong> 60 times per second.</li>
                <li>Calculates color blending & transparency per pixel.</li>
                <li>Handles 3D perspective & rotation math.</li>
                <li><strong>Role:</strong> "The Artist" - Paints the pixels.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
    </motion.div>
  );
}
