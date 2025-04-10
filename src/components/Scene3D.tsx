
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import KenyaMap3D from './KenyaMap3D';
import { Suspense } from 'react';

const Scene3D = ({ viewMode = 'front', visible = true, flying = false }) => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          <KenyaMap3D viewMode={viewMode} visible={visible} flying={flying} />
          <OrbitControls 
            enableZoom={false} 
            enablePan={false}
            enableRotate={false}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene3D;
