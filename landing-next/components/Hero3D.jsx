'use client'
import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'

// Roterend 3D-object (bal-achtige icosaëder met neon-draadmodel) dat de muis volgt.
function Ball() {
  const group = useRef()
  useFrame(({ pointer }, dt) => {
    const g = group.current
    g.rotation.y += dt * 0.45
    g.rotation.x += (pointer.y * 0.6 - g.rotation.x) * Math.min(dt * 3, 1)
    g.position.x += (pointer.x * 0.7 - g.position.x) * Math.min(dt * 3, 1)
  })
  return (
    <Float speed={1.6} rotationIntensity={0.3} floatIntensity={0.9}>
      <group ref={group}>
        <mesh>
          <icosahedronGeometry args={[1.5, 1]} />
          <meshStandardMaterial color="#0b1f17" flatShading roughness={0.35} metalness={0.6} />
        </mesh>
        <mesh scale={1.012}>
          <icosahedronGeometry args={[1.5, 1]} />
          <meshBasicMaterial color="#39ff88" wireframe />
        </mesh>
        <mesh scale={0.62}>
          <dodecahedronGeometry args={[1.5, 0]} />
          <meshStandardMaterial color="#39ff88" emissive="#39ff88" emissiveIntensity={0.8} flatShading />
        </mesh>
      </group>
    </Float>
  )
}

export default function Hero3D() {
  return (
    <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }} dpr={[1, 1.75]} aria-hidden>
      <ambientLight intensity={0.5} />
      <pointLight position={[4, 4, 4]} intensity={60} color="#39ff88" />
      <pointLight position={[-4, -2, 3]} intensity={25} color="#7dffb0" />
      <Ball />
    </Canvas>
  )
}
