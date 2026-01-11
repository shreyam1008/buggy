import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { Box, Sparkles, Flower2, Play, Pause, RotateCcw, Zap } from 'lucide-react';
import { Button } from '../components/shared/Button';

// 3D-like animation using CSS transforms
export default function ThreeDShowcase() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(1);
  const rotateY = useMotionValue(0);
  const rotateX = useMotionValue(0);
  const scale = useMotionValue(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-rotation
  useEffect(() => {
    if (!isPlaying) return;
    
    const animation = animate(rotateY, rotateY.get() + 360, {
      duration: 20 / rotationSpeed,
      repeat: Infinity,
      ease: 'linear',
    });
    
    return () => animation.stop();
  }, [isPlaying, rotationSpeed]);

  // Mouse/touch interaction
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    rotateX.set(-y * 30);
    if (!isPlaying) {
      rotateY.set(x * 60);
    }
  };

  const togglePlay = () => setIsPlaying(!isPlaying);
  const resetRotation = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  // Particle system
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 2,
  }));

  return (
    <motion.div
      className="page-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <motion.div
          animate={{ rotateY: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        >
          <Box size={48} color="var(--primary-color)" />
        </motion.div>
        <h1 className="page-title">3D Showcase</h1>
        <p className="page-subtitle">Interactive 3D Experience • Radha Krishna Themed</p>
      </div>

      {/* 3D Canvas */}
      <div className="card" style={{ marginBottom: '1.5rem', overflow: 'hidden' }}>
        <div className="card-content">
          <div
            ref={containerRef}
            onPointerMove={handlePointerMove}
            style={{
              height: '400px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(236, 72, 153, 0.15))',
              borderRadius: '16px',
              position: 'relative',
              perspective: '1000px',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
          >
            {/* Floating Particles */}
            {particles.map((p) => (
              <motion.div
                key={p.id}
                style={{
                  position: 'absolute',
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: p.size,
                  height: p.size,
                  borderRadius: '50%',
                  background: 'rgba(236, 72, 153, 0.6)',
                  boxShadow: '0 0 10px rgba(236, 72, 153, 0.4)',
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.3, 0.8, 0.3],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: p.duration,
                  repeat: Infinity,
                  delay: p.delay,
                }}
              />
            ))}

            {/* 3D Lotus Flower */}
            <motion.div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                x: '-50%',
                y: '-50%',
                rotateY,
                rotateX,
                scale,
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Central Lotus */}
              <motion.div
                style={{
                  width: '160px',
                  height: '160px',
                  position: 'relative',
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Petals */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                  <motion.div
                    key={angle}
                    style={{
                      position: 'absolute',
                      width: '60px',
                      height: '100px',
                      left: '50%',
                      top: '50%',
                      marginLeft: '-30px',
                      marginTop: '-70px',
                      background: `linear-gradient(to top, #ec4899, #f472b6, #fce7f3)`,
                      borderRadius: '50% 50% 50% 50%',
                      transformOrigin: 'center bottom',
                      transform: `rotateZ(${angle}deg) rotateX(25deg)`,
                      boxShadow: '0 0 20px rgba(236, 72, 153, 0.4)',
                    }}
                    animate={{
                      rotateX: [25, 35, 25],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
                
                {/* Center */}
                <motion.div
                  style={{
                    position: 'absolute',
                    width: '50px',
                    height: '50px',
                    left: '50%',
                    top: '50%',
                    marginLeft: '-25px',
                    marginTop: '-25px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                    boxShadow: '0 0 30px rgba(251, 191, 36, 0.6)',
                  }}
                  animate={{
                    scale: [1, 1.1, 1],
                    boxShadow: [
                      '0 0 30px rgba(251, 191, 36, 0.6)',
                      '0 0 50px rgba(251, 191, 36, 0.8)',
                      '0 0 30px rgba(251, 191, 36, 0.6)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            </motion.div>

            {/* Floating Icons */}
            <motion.div
              style={{ position: 'absolute', top: '20%', left: '15%' }}
              animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Flower2 size={32} color="#ec4899" />
            </motion.div>
            
            <motion.div
              style={{ position: 'absolute', bottom: '25%', right: '10%' }}
              animate={{ y: [0, 15, 0], rotate: [0, -15, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
            >
              <Sparkles size={28} color="#fbbf24" />
            </motion.div>

            <motion.div
              style={{ position: 'absolute', top: '30%', right: '20%' }}
              animate={{ y: [0, -10, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
            >
              <span style={{ fontSize: '2rem' }}>🦚</span>
            </motion.div>

            <motion.div
              style={{ position: 'absolute', bottom: '20%', left: '20%' }}
              animate={{ y: [0, 12, 0], rotate: [0, 180, 360] }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              <span style={{ fontSize: '1.5rem' }}>🪷</span>
            </motion.div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <Button variant={isPlaying ? 'secondary' : 'primary'} size="sm" onClick={togglePlay}>
              {isPlaying ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Play</>}
            </Button>
            <Button variant="ghost" size="sm" onClick={resetRotation}>
              <RotateCcw size={16} /> Reset
            </Button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Speed:</span>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.5"
                value={rotationSpeed}
                onChange={(e) => setRotationSpeed(Number(e.target.value))}
                style={{ width: '80px' }}
              />
              <span style={{ fontSize: '0.85rem', color: 'var(--accent-color)' }}>{rotationSpeed}x</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Info */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h3 className="card-title"><Zap size={18} style={{ marginRight: '0.5rem', display: 'inline' }} />3D Technology</h3>
        </div>
        <div className="card-content">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {[
              { name: 'CSS 3D Transforms', desc: 'Hardware-accelerated 3D using perspective and rotations', status: 'Active' },
              { name: 'Framer Motion', desc: 'Smooth 60fps animations with spring physics', status: 'Active' },
              { name: 'React Three Fiber', desc: 'Full WebGL 3D scenes (optional upgrade)', status: 'Ready' },
              { name: 'Interactive Controls', desc: 'Mouse and touch rotation support', status: 'Active' },
            ].map((tech, i) => (
              <motion.div
                key={i}
                style={{
                  padding: '1rem',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '12px',
                }}
                whileHover={{ scale: 1.02 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4 style={{ color: 'white', fontSize: '0.95rem' }}>{tech.name}</h4>
                  <span className="tag" style={{ 
                    background: tech.status === 'Active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                    color: tech.status === 'Active' ? '#6ee7b7' : '#a5b4fc',
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

      {/* Features */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title"><Sparkles size={18} style={{ marginRight: '0.5rem', display: 'inline' }} />Features</h3>
        </div>
        <div className="card-content">
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {[
              '🪷 Animated 3D Lotus Flower with petal physics',
              '✨ Dynamic particle system (30 floating particles)',
              '🎮 Interactive mouse/touch rotation controls',
              '⚡ GPU-accelerated CSS 3D transforms',
              '🔄 Configurable rotation speed',
              '📱 Fully responsive and mobile-optimized',
              '🎨 Radha Krishna themed colors and icons',
              '🔮 Ready for React Three Fiber upgrade',
            ].map((feature, i) => (
              <motion.div
                key={i}
                style={{
                  padding: '0.75rem',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ x: 4 }}
              >
                {feature}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
