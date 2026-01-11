import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Galaxy } from './Galaxy';
import { Suspense } from 'react';

export default function Scene() {
  return (
    <div style={{ width: '100%', height: '600px', borderRadius: '16px', overflow: 'hidden' }}>
      <Canvas
        camera={{ position: [0, 4, 6], fov: 60 }}
        dpr={[1, 2]} // Handle high-DPI screens
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={['#050510']} />
          <ambientLight intensity={0.5} />
          
          <Galaxy />
          
          {/* Background Stars */}
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          
          <OrbitControls 
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
            minDistance={2}
            maxDistance={15}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
