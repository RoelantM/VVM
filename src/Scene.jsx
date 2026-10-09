import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'

const GREEN = '#0a8f3c'
export const scroll = { p: 0 } // blijft bestaan voor App.jsx; de scène leest zelf de DOM
const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const GROUND = -2.1 // "grasrand" in wereldcoördinaten (onderkant van beeld)
const ball = { x: 0, y: 0, z: 0 } // positie van de hoofdbal, gedeeld met o.a. het doel
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt))
const upp = (camera, z, h) => (2 * Math.tan((camera.fov * Math.PI) / 360) * (camera.position.z - z)) / h // wereld-eenheden per pixel

const elCache = {}
const getEl = (id) => {
  const c = elCache[id]
  if (c && c.isConnected) return c
  return (elCache[id] = id === 'top' ? document.querySelector('.hero') : document.getElementById(id))
}

// ---------- Voetbal: patroon in shader (12 pentagonen + 20 zeshoeken) met glans en rand-licht ----------
const phi = (1 + Math.sqrt(5)) / 2
const pent = []
for (const a of [-1, 1]) for (const b of [-phi, phi]) pent.push([0, a, b], [a, b, 0], [b, 0, a])
const centers = pent.map((v) => new THREE.Vector3(...v).normalize())
const hex = []
const faces = new THREE.IcosahedronGeometry(1, 0).toNonIndexed().attributes.position
for (let i = 0; i < faces.count; i += 3) {
  hex.push(new THREE.Vector3().fromBufferAttribute(faces, i).add(new THREE.Vector3().fromBufferAttribute(faces, i + 1)).add(new THREE.Vector3().fromBufferAttribute(faces, i + 2)).normalize())
}
const all = [...centers, ...hex]

const ballMaterial = () => new THREE.ShaderMaterial({
  uniforms: { uC: { value: all }, uGreen: { value: new THREE.Color(GREEN) } },
  vertexShader: `varying vec3 vP; varying vec3 vN; varying vec3 vV;
    void main(){ vP = normalize(position); vN = normalize(normalMatrix*normal);
      vec4 mv = modelViewMatrix*vec4(position,1.); vV = normalize(-mv.xyz);
      gl_Position = projectionMatrix*mv; }`,
  fragmentShader: `uniform vec3 uC[32]; uniform vec3 uGreen; varying vec3 vP; varying vec3 vN; varying vec3 vV;
    void main(){
      float b1=-2., b2=-2.; int bi=0;
      for(int i=0;i<32;i++){ float d=dot(vP,uC[i]); if(d>b1){b2=b1;b1=d;bi=i;} else if(d>b2){b2=d;} }
      vec3 col = bi<12 ? uGreen*0.85 : vec3(0.96);
      float seam = smoothstep(0.04,0.0,b1-b2);
      col = mix(col, vec3(0.03,0.1,0.06), seam);
      vec3 N = normalize(vN); vec3 L = normalize(vec3(.45,.75,.6));
      float diff = 0.3 + 0.8*max(dot(N,L),0.);
      float spec = pow(max(dot(reflect(-L,N),vV),0.), 38.)*0.55*(1.-seam);
      float rim = pow(1.-max(dot(N,vV),0.), 3.)*0.35;
      gl_FragColor = vec4(col*diff + spec + rim*vec3(.2,.9,.5), 1.);
    }`,
})
const ballMat = ballMaterial()
const Ball = (props) => <mesh material={ballMat} {...props}><sphereGeometry args={[1, 48, 48]} /></mesh>

// ---------- Pinned: hangt een 3D-object aan een DOM-element (blijft synchroon met de pagina) ----------
function Pinned({ anchor, dx = 0, dy = 0, z = 0, scale = 1, edge = 'center', fixedY, children }) {
  const ref = useRef()
  const pop = useRef(0)
  useFrame(({ camera, size }, dt) => {
    const e = getEl(anchor); const g = ref.current
    if (!e || !g) return
    const mobile = size.width < 700
    const r = e.getBoundingClientRect()
    const k = upp(camera, z, size.height)
    const cy = (edge === 'top' ? r.top : r.top + r.height / 2) + dy - size.height / 2
    g.position.x = dx * (mobile ? 0.5 : 1) * (size.width / 2) * k
    g.position.y = fixedY ?? -cy * k
    g.position.z = z
    // alleen zichtbaar als het element in beeld is; "pop" erin
    const inView = r.bottom > size.height * 0.3 && r.top < size.height * 0.75 ? 1 : 0
    pop.current = damp(pop.current, inView, 6, Math.min(dt, 0.05))
    const s = scale * (mobile ? 0.7 : 1) * (1 - Math.pow(1 - pop.current, 3))
    g.visible = s > 0.01
    g.scale.setScalar(Math.max(s, 0.0001))
  })
  return <group ref={ref}>{children}</group>
}

// ---------- Hoofdbal: dribbelt langs de secties, stuitert (sneller bij scrollen) ----------
const SPEC = {
  top: { x: 0.68, z: 0, s: 0.95 },
  nieuws: { x: -0.92, z: -1, s: 0.5 },
  wedstrijden: { x: 0.82, z: -1.1, s: 0.7 },
  teams: { x: 0.92, z: -1, s: 0.5 },
  shop: { x: -0.92, z: -1, s: 0.5 },
  lid: { x: 0.92, z: -1, s: 0.5 },
  sponsors: { x: -0.92, z: -1, s: 0.5 },
  contact: { x: 0.55, z: -0.5, s: 0.9 },
}

function HeroBall() {
  const g = useRef(); const body = useRef(); const spot = useRef()
  const st = useRef({ phase: 0, lastScroll: 0, vs: 0, x: null, s: 1, z: 0 })
  useFrame(({ camera, size, pointer }, dt0) => {
    const dt = Math.min(dt0, 0.05); const S = st.current
    const mobile = size.width < 700
    // doel = gewogen gemiddelde van de secties dicht bij het midden van het scherm
    let wsum = 0, tx = 0, tz = 0, ts = 0
    for (const [id, sp] of Object.entries(SPEC)) {
      const e = getEl(id); if (!e) continue
      const r = e.getBoundingClientRect()
      const d = Math.abs(r.top + r.height / 2 - size.height / 2) / size.height
      const w = Math.pow(Math.max(0, 1 - d * 1.3), 2) + 1e-4
      wsum += w; tx += w * sp.x; tz += w * sp.z; ts += w * sp.s
    }
    tx /= wsum; tz /= wsum; ts /= wsum
    const k = upp(camera, tz, size.height)
    const wx = tx * (mobile ? 0.45 : 1) * (size.width / 2) * k + pointer.x * 0.15
    S.z = damp(S.z, tz, 3, dt); S.s = damp(S.s, ts * (mobile ? 0.55 : 1), 3, dt)
    const prevX = S.x ?? wx
    S.x = damp(S.x ?? wx, wx, 3, dt)
    // scrollsnelheid -> stuiterritme
    const sy = window.scrollY; const v = Math.abs(sy - S.lastScroll) / Math.max(dt, 1e-3); S.lastScroll = sy
    S.vs = damp(S.vs, Math.min(v, 4000), 5, dt)
    if (!reduce) S.phase += dt * (2.6 + S.vs * 0.004)
    const h = reduce ? 0.3 : Math.abs(Math.sin(S.phase)) // 0 = grond
    const R = S.s
    const amp = reduce ? 0 : 0.55 + Math.min(S.vs, 2500) * 0.0004
    const y = GROUND + R + amp * h
    const contact = 1 - Math.min(1, h / 0.12)
    g.current.position.set(S.x, y, S.z)
    g.current.scale.set(R * (1 + 0.1 * contact), R * (1 - 0.18 * contact), R * (1 + 0.1 * contact))
    if (!reduce) {
      body.current.rotation.z -= (S.x - prevX) / R + dt * 0.4
      body.current.rotation.y += dt * (0.7 + S.vs * 0.003)
      body.current.rotation.x += dt * 0.25
    }
    // schaduw/lichtvlek op de grond
    const sp = spot.current
    sp.position.set(S.x, GROUND + 0.01, S.z - 0.01)
    const f = 1 - 0.4 * h
    sp.scale.set(R * 1.25 * f, R * 0.28 * f, 1)
    sp.material.opacity = 0.35 * (1 - 0.7 * h)
    ball.x = S.x; ball.y = y; ball.z = S.z
  })
  return (
    <>
      <group ref={g}><group ref={body}><Ball /></group></group>
      <mesh ref={spot}><circleGeometry args={[1, 32]} /><meshBasicMaterial color="#34d27a" transparent depthWrite={false} /></mesh>
    </>
  )
}

// ---------- Decor ----------
function Cone() {
  return (
    <group>
      <mesh position={[0, 0.34, 0]}><coneGeometry args={[0.24, 0.68, 28]} /><meshStandardMaterial color="#ff7a1a" roughness={0.5} /></mesh>
      <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[0.14, 0.17, 0.1, 28]} /><meshStandardMaterial color="#fff" /></mesh>
      <mesh position={[0, 0.02, 0]}><boxGeometry args={[0.6, 0.04, 0.6]} /><meshStandardMaterial color="#ff7a1a" /></mesh>
    </group>
  )
}

function CornerFlag() {
  const flag = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const pos = flag.current.geometry.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) + 0.3 // 0..0.6
      pos.setZ(i, reduce ? 0 : Math.sin(x * 8 - t * 5) * 0.06 * x * 2)
    }
    pos.needsUpdate = true
  })
  return (
    <group>
      <mesh position={[0, 0.85, 0]}><cylinderGeometry args={[0.03, 0.03, 1.7, 10]} /><meshStandardMaterial color="#eee" /></mesh>
      <mesh ref={flag} position={[0.32, 1.4, 0]}><planeGeometry args={[0.6, 0.4, 14, 4]} /><meshStandardMaterial color={GREEN} side={THREE.DoubleSide} /></mesh>
    </group>
  )
}

// Doel met net dat golft als de bal er dichtbij komt
function Goal() {
  const root = useRef(); const net = useRef()
  const s = useRef({ amp: 0, inside: false })
  const v = useMemo(() => new THREE.Vector3(), [])
  const mat = <meshStandardMaterial color="#f4f4f0" roughness={0.35} metalness={0.2} />
  useFrame(({ clock }, dt0) => {
    const dt = Math.min(dt0, 0.05); const S = s.current
    root.current.getWorldPosition(v)
    const dist = Math.hypot(ball.x - v.x, ball.y - (v.y + 0.7))
    if (dist < 1.2 && !S.inside) { S.inside = true; S.amp = reduce ? 0 : 0.5 }
    if (dist > 1.8) S.inside = false
    S.amp *= Math.exp(-2.2 * dt)
    const pos = net.current.geometry.attributes.position
    const t = clock.elapsedTime
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i)
      const r = Math.hypot(x, y - 0.1)
      pos.setZ(i, S.amp * Math.sin(r * 7 - t * 12) * Math.exp(-r * 0.9) - 0.05 * Math.sin(t + x * 3) * (reduce ? 0 : 1))
    }
    pos.needsUpdate = true
  })
  return (
    <group ref={root} rotation={[0, -0.25, 0]} scale={1.15}>
      <mesh position={[-1.1, 0.75, 0]}><cylinderGeometry args={[0.05, 0.05, 1.5, 14]} />{mat}</mesh>
      <mesh position={[1.1, 0.75, 0]}><cylinderGeometry args={[0.05, 0.05, 1.5, 14]} />{mat}</mesh>
      <mesh position={[0, 1.5, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.05, 0.05, 2.25, 14]} />{mat}</mesh>
      <mesh ref={net} position={[0, 0.75, -0.55]}><planeGeometry args={[2.2, 1.5, 22, 15]} /><meshBasicMaterial color="#b9f2cc" wireframe transparent opacity={0.45} /></mesh>
    </group>
  )
}

// Clubshirt in 3D (omtrek van het SVG-shirt uit de shop), draait en wisselt thuis/uit
const shirtShape = (() => {
  const P = (x, y) => [(x - 50) * 0.034, (50 - y) * 0.034]
  const sh = new THREE.Shape()
  sh.moveTo(...P(32, 12))
  for (const [x, y] of [[14, 24], [22, 40], [30, 36], [30, 88], [70, 88], [70, 36], [78, 40], [86, 24], [68, 12]]) sh.lineTo(...P(x, y))
  sh.quadraticCurveTo(...P(50, 26), ...P(32, 12))
  return sh
})()
const COL_HOME = new THREE.Color(GREEN), COL_AWAY = new THREE.Color('#f4f4f0')

function Shirt() {
  const g = useRef(); const body = useRef(); const badge = useRef()
  const geo = useMemo(() => new THREE.ExtrudeGeometry(shirtShape, { depth: 0.16, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.04, bevelSegments: 3 }), [])
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    const m = (Math.sin(t * 0.5) + 1) / 2
    const mix = m > 0.5 ? 1 : 0
    const k = Math.min(1, dt * 3)
    body.current.material.color.lerp(mix ? COL_AWAY : COL_HOME, k)
    badge.current.material.color.lerp(mix ? COL_HOME : COL_AWAY, k)
    if (!reduce) { g.current.rotation.y = Math.sin(t * 0.8) * 0.95; g.current.position.y = Math.sin(t * 1.4) * 0.08 }
  })
  return (
    <group ref={g} rotation={[0.1, 0.5, 0]} scale={0.7}>
      <mesh ref={body} geometry={geo} position={[0, 0, -0.08]}><meshStandardMaterial color={GREEN} roughness={0.55} /></mesh>
      <mesh ref={badge} position={[0.22, 0.3, 0.16]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.1, 0.1, 0.03, 24]} /><meshStandardMaterial color="#fff" /></mesh>
    </group>
  )
}

// Sponsors: ballen die om een middelpunt draaien
function Orbit() {
  const g = useRef()
  useFrame(({ clock }, dt) => {
    if (!reduce) g.current.rotation.y += dt * 0.9
    g.current.rotation.z = Math.sin(clock.elapsedTime * 0.6) * 0.2
  })
  return (
    <group ref={g}>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2
        return <Ball key={i} position={[Math.cos(a) * 1.1, Math.sin(a * 2) * 0.15, Math.sin(a) * 1.1]} scale={0.26} />
      })}
    </group>
  )
}

function Rig() {
  useFrame(({ camera, pointer }, dt0) => {
    const dt = Math.min(dt0, 0.05)
    camera.position.x = damp(camera.position.x, reduce ? 0 : pointer.x * 0.3, 3, dt)
    camera.position.y = damp(camera.position.y, reduce ? 0 : pointer.y * 0.12, 3, dt)
    camera.lookAt(0, 0, 0)
  })
  return null
}

export default function Scene() {
  return (
    <div className="scene" aria-hidden="true">
      <Canvas eventSource={document.documentElement} eventPrefix="client" camera={{ position: [0, 0, 10.5], fov: 30 }} dpr={[1, 1.75]} gl={{ powerPreference: 'high-performance' }}>
        <hemisphereLight args={['#ffffff', '#0a5a28', 0.9]} />
        <directionalLight position={[4, 6, 5]} intensity={1.7} />
        <pointLight position={[0, GROUND + 0.6, 2]} color="#34d27a" intensity={6} distance={9} />
        <Rig />
        <HeroBall />
        {/* grasrand */}
        <mesh position={[0, GROUND, -1.5]}><planeGeometry args={[40, 0.015]} /><meshBasicMaterial color="#34d27a" transparent opacity={0.3} /></mesh>
        <Sparkles count={70} scale={[14, 8, 4]} size={3} speed={reduce ? 0 : 0.35} opacity={0.6} color="#9fe3b6" />

        <Pinned anchor="nieuws" dx={-0.62} z={-1} fixedY={GROUND} scale={0.9}><Cone /></Pinned>
        <Pinned anchor="nieuws" dx={-0.48} z={-1.3} fixedY={GROUND} scale={0.9}><Cone /></Pinned>
        <Pinned anchor="wedstrijden" dx={0.82} z={-1.2} fixedY={GROUND}><Goal /></Pinned>
        <Pinned anchor="teams" dx={-0.95} z={-1} fixedY={GROUND}><CornerFlag /></Pinned>
        <Pinned anchor="shop" dx={0.72} dy={120} edge="top" z={-0.5}><Shirt /></Pinned>
        <Pinned anchor="sponsors" dx={0.72} z={-1} scale={0.8}><Orbit /></Pinned>
        <Pinned anchor="contact" dx={-0.9} z={-1} fixedY={GROUND}><CornerFlag /></Pinned>
      </Canvas>
    </div>
  )
}
