import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

const GREEN = '#0a8f3c'
export const scroll = { p: 0 }

// Voetbalpatroon in een shader: 12 pentagonen (icosaëder-hoekpunten) + 20 zeshoeken (vlakmiddens).
const phi = (1 + Math.sqrt(5)) / 2
const pent = []
for (const a of [-1, 1]) for (const b of [-phi, phi]) {
  pent.push([0, a, b], [a, b, 0], [b, 0, a])
}
const centers = pent.map((v) => new THREE.Vector3(...v).normalize())
// Zeshoekmiddens = middens van de 20 icosaëdervlakken
const hex = []
const faces = new THREE.IcosahedronGeometry(1, 0).toNonIndexed().attributes.position
for (let i = 0; i < faces.count; i += 3) {
  hex.push(new THREE.Vector3().fromBufferAttribute(faces, i).add(new THREE.Vector3().fromBufferAttribute(faces, i + 1)).add(new THREE.Vector3().fromBufferAttribute(faces, i + 2)).normalize())
}
const all = [...centers, ...hex]

const ballMaterial = () => new THREE.ShaderMaterial({
  uniforms: { uC: { value: all }, uGreen: { value: new THREE.Color(GREEN) } },
  vertexShader: `varying vec3 vP; varying vec3 vN;
    void main(){ vP = normalize(position); vN = normalize(normalMatrix*normal);
      gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform vec3 uC[32]; uniform vec3 uGreen; varying vec3 vP; varying vec3 vN;
    void main(){
      float b1=-2., b2=-2.; int bi=0;
      for(int i=0;i<32;i++){ float d=dot(vP,uC[i]); if(d>b1){b2=b1;b1=d;bi=i;} else if(d>b2){b2=d;} }
      vec3 col = bi<12 ? uGreen*0.9 : vec3(0.97);
      float seam = smoothstep(0.035,0.0,b1-b2);
      col = mix(col, vec3(0.04,0.12,0.07), seam);
      float l = 0.35 + 0.75*max(dot(normalize(vN), normalize(vec3(.5,.8,.7))),0.);
      gl_FragColor = vec4(col*l,1.);
    }`,
})

function Ball({ scale = 1, ...props }) {
  const mat = useMemo(ballMaterial, [])
  return (
    <mesh material={mat} scale={scale} {...props}>
      <sphereGeometry args={[1, 48, 48]} />
    </mesh>
  )
}

// De hoofdbal volgt de scroll: rolt naar links/rechts langs de secties.
function HeroBall() {
  const ref = useRef()
  useFrame((s, dt) => {
    const t = scroll.p
    const tx = Math.cos(t * Math.PI * 5) * 2.6
    const ty = 0.1 + Math.sin(t * Math.PI * 5) * 0.2
    const g = ref.current
    const isMobile = s.size.width < 700
    g.position.x += ((isMobile ? tx * 0.35 : tx) - g.position.x) * Math.min(dt * 4, 1)
    g.position.y += (ty - g.position.y) * Math.min(dt * 4, 1)
    g.rotation.x += dt * 0.4 + (t * 0.01)
    g.rotation.y += dt * 0.9
    g.scale.setScalar(isMobile ? 0.9 : 1.35)
  })
  return <group ref={ref}><Ball /></group>
}

function Cone({ position }) {
  return (
    <Float speed={2} rotationIntensity={0.6} floatIntensity={1.2} position={position}>
      <mesh><coneGeometry args={[0.35, 0.8, 24]} /><meshStandardMaterial color="#ff7a1a" /></mesh>
      <mesh position={[0, -0.4, 0]}><boxGeometry args={[0.9, 0.06, 0.9]} /><meshStandardMaterial color="#ff7a1a" /></mesh>
    </Float>
  )
}

function Flag({ position }) {
  return (
    <Float speed={1.6} rotationIntensity={0.8} floatIntensity={1} position={position}>
      <mesh><cylinderGeometry args={[0.03, 0.03, 1.8, 8]} /><meshStandardMaterial color="#eee" /></mesh>
      <mesh position={[0.32, 0.65, 0]}><planeGeometry args={[0.65, 0.45]} /><meshStandardMaterial color={GREEN} side={THREE.DoubleSide} /></mesh>
    </Float>
  )
}

function Goal({ position }) {
  const m = <meshStandardMaterial color="#f2f2f2" />
  return (
    <Float speed={1.2} rotationIntensity={0.5} floatIntensity={0.8} position={position} rotation={[0.2, 0.6, 0]}>
      <mesh position={[-1.1, 0, 0]}><cylinderGeometry args={[0.05, 0.05, 1.5, 12]} />{m}</mesh>
      <mesh position={[1.1, 0, 0]}><cylinderGeometry args={[0.05, 0.05, 1.5, 12]} />{m}</mesh>
      <mesh position={[0, 0.75, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.05, 0.05, 2.25, 12]} />{m}</mesh>
      <mesh position={[0, 0, -0.5]}><planeGeometry args={[2.2, 1.5, 11, 8]} /><meshBasicMaterial color="#9fe3b6" wireframe transparent opacity={0.5} /></mesh>
    </Float>
  )
}

function MiniBall({ position, s = 0.35 }) {
  return <Float speed={2.5} rotationIntensity={2} floatIntensity={2} position={position}><Ball scale={s} /></Float>
}

// Decor verspreid over de paginalengte; groep schuift mee met de scroll (parallax).
function Decor() {
  const g = useRef()
  useFrame((s) => {
    const H = 34
    g.current.position.y = scroll.p * H * 0.8
  })
  const side = (s, x) => (s.size?.width < 700 ? x * 0.4 : x)
  return (
    <group ref={g}>
      <Cone position={[-4, -4, -2]} />
      <Goal position={[4.2, -9, -2]} />
      <Flag position={[-4.4, -14, -1]} />
      <MiniBall position={[4, -17, -1]} />
      <MiniBall position={[-3.4, -20, -2]} s={0.5} />
      <Cone position={[4.4, -24, -2]} />
      <MiniBall position={[3.2, -27, -1]} s={0.28} />
      <MiniBall position={[-4.2, -29, -1]} s={0.4} />
      <Goal position={[-4, -32, -2]} />
    </group>
  )
}

export default function Scene() {
  return (
    <div className="scene" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[4, 6, 5]} intensity={1.6} />
        <HeroBall />
        <Decor />
      </Canvas>
    </div>
  )
}
