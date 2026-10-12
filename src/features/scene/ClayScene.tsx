import {
  Suspense,
  useRef,
  useEffect,
  useState,
  Component,
  type ReactNode,
  type MutableRefObject,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { Group, MathUtils, MeshStandardMaterial, SphereGeometry } from "three";

const graphite = "#363736",
  gold = "#d8b878",
  cream = "#e5dfcc";
// A small shared palette avoids allocating one GPU material per clay object.
const palette = new Map<string, MeshStandardMaterial>();
const sphereGeometry = new SphereGeometry(1, 16, 12);
function material(color: string) {
  if (!palette.has(color))
    palette.set(
      color,
      new MeshStandardMaterial({ color, roughness: 0.62, metalness: color === gold ? 0.22 : 0.06 }),
    );
  return palette.get(color)!;
}

function Block({
  position = [0, 0, 0],
  size = [1, 1, 0.3],
  color = graphite,
  rotation = [0, 0, 0],
}: {
  position?: [number, number, number];
  size?: [number, number, number];
  color?: string;
  rotation?: [number, number, number];
}) {
  return (
    <RoundedBox
      args={size}
      radius={Math.min(0.12, ...size.map((n) => n * 0.35))}
      smoothness={3}
      position={position}
      rotation={rotation}
      castShadow
      receiveShadow
      material={material(color)}
    />
  );
}
function Sphere({
  position,
  color = cream,
  size = 0.08,
}: {
  position: [number, number, number];
  color?: string;
  size?: number;
}) {
  return (
    <mesh
      position={position}
      scale={size}
      castShadow
      geometry={sphereGeometry}
      material={material(color)}
    />
  );
}
function Robot() {
  return (
    <group position={[0, 0.9, 0.15]}>
      <Block size={[1.18, 1.25, 0.6]} />
      <Block position={[0, 0, 0.37]} size={[0.85, 0.6, 0.18]} color={cream} />
      <Block position={[0, 0, 0.49]} size={[0.61, 0.37, 0.08]} color="#1e2421" />
      <Sphere position={[-0.18, 0, 0.55]} color={gold} size={0.065} />
      <Sphere position={[0.18, 0, 0.55]} color={gold} size={0.065} />
      <Block position={[0, 0.75, 0]} size={[0.065, 0.3, 0.065]} color={gold} />
      <Sphere position={[0, 0.93, 0]} color={gold} />
    </group>
  );
}
function Code() {
  return (
    <group position={[-2.05, 0.3, 0.4]} rotation={[0, 0.13, 0]}>
      <Block size={[1.85, 2.35, 0.45]} />
      {[-0.54, -0.3, -0.06].map((x) => (
        <Sphere key={x} position={[x, 0.87, 0.29]} color={gold} size={0.057} />
      ))}
      <Block position={[0, 0.61, 0.25]} size={[1.6, 0.025, 0.02]} color="#696c61" />
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.4, 0.12, 0.3]}>
          <Block size={[0.43, 0.065, 0.07]} rotation={[0, 0, side * 0.7]} color={gold} />
          <Block
            position={[0, -0.26, 0]}
            size={[0.43, 0.065, 0.07]}
            rotation={[0, 0, -side * 0.7]}
            color={gold}
          />
        </group>
      ))}
      <Block
        position={[0, 0, 0.3]}
        size={[0.065, 0.6, 0.07]}
        rotation={[0, 0, -0.3]}
        color={gold}
      />
      {[0, 1, 2].map((i) => (
        <Block
          key={i}
          position={[-0.12, -0.5 - i * 0.22, 0.28]}
          size={[1.12 - i * 0.15, 0.055, 0.07]}
          color={cream}
        />
      ))}
    </group>
  );
}
function Growth({ progress }: { progress: MutableRefObject<number> }) {
  const ref = useRef<Group>(null);
  useFrame(() => {
    if (ref.current)
      ref.current.children.forEach((c, i) => {
        c.scale.y = MathUtils.lerp(c.scale.y, 0.4 + (i + 1) * 0.14 + progress.current * 0.5, 0.055);
      });
  });
  return (
    <group position={[2.1, 0.2, 0.0]} rotation={[0, -0.17, 0]}>
      <Block size={[1.85, 2.2, 0.4]} />
      <group ref={ref} position={[-0.6, -0.85, 0.35]}>
        {[0, 1, 2, 3].map((i) => (
          <group key={i} position={[i * 0.39, 0, 0]}>
            <Block
              position={[0, (0.55 + i * 0.3) / 2, 0]}
              size={[0.24, 0.55 + i * 0.3, 0.3]}
              color={i === 3 ? gold : cream}
            />
          </group>
        ))}
      </group>
      <Block
        position={[0.12, 0.7, 0.28]}
        size={[1.23, 0.06, 0.08]}
        color={gold}
        rotation={[0, 0, 0.45]}
      />
    </group>
  );
}
function Sculpture({
  progress,
  animated,
}: {
  progress: MutableRefObject<number>;
  animated: boolean;
}) {
  const group = useRef<Group>(null);
  const build = useRef<Group>(null);
  const automate = useRef<Group>(null);
  const grow = useRef<Group>(null);
  useFrame(({ clock, pointer }) => {
    if (!group.current) return;
    const t = clock.elapsedTime;
    group.current.rotation.y = MathUtils.lerp(
      group.current.rotation.y,
      -0.1 + progress.current * 0.55 + (animated ? pointer.x * 0.09 : 0),
      0.04,
    );
    group.current.position.y = animated ? Math.sin(t * 0.65) * 0.055 : 0;
    if (build.current) {
      build.current.rotation.y = MathUtils.lerp(
        build.current.rotation.y,
        progress.current * 0.18,
        0.04,
      );
      build.current.position.y = MathUtils.lerp(
        build.current.position.y,
        Math.sin(progress.current * Math.PI) * 0.15,
        0.04,
      );
    }
    if (automate.current)
      automate.current.position.y = MathUtils.lerp(
        automate.current.position.y,
        progress.current > 0.3 && progress.current < 0.7 ? 0.2 : 0,
        0.04,
      );
    if (grow.current)
      grow.current.rotation.y = MathUtils.lerp(
        grow.current.rotation.y,
        -Math.max(0, progress.current - 0.6) * 0.4,
        0.04,
      );
  });
  return (
    <group ref={group}>
      <Block position={[0, -1.7, 0]} size={[6.7, 0.34, 2.7]} color="#242824" />
      <Block position={[-2.05, -1.3, 0.15]} size={[2.05, 0.55, 1.8]} color="#30352f" />
      <Block position={[2.1, -1.25, 0]} size={[2.1, 0.65, 1.8]} color="#30352f" />
      <group ref={build}>
        <Code />
      </group>
      <group ref={automate}>
        <Robot />
      </group>
      <group ref={grow}>
        <Growth progress={progress} />
      </group>
      <Block position={[0, -0.65, 0.2]} size={[1.1, 1.05, 0.65]} />
      {[-0.25, 0, 0.25].map((x, i) => (
        <group key={x}>
          <Sphere position={[x, i === 1 ? -0.38 : -0.84, 0.61]} color={gold} />
          <Block
            position={[x / 2, -0.65, 0.57]}
            size={[0.035, 0.45, 0.04]}
            rotation={[0, 0, x === 0 ? 0 : x > 0 ? -0.6 : 0.6]}
            color={gold}
          />
        </group>
      ))}
      {[-1, 1].map((x) => (
        <group key={x}>
          <Block position={[x * 1.03, 0.65, -0.1]} size={[0.65, 0.065, 0.07]} color={gold} />
          <Block position={[x * 0.84, 0.22, -0.1]} size={[0.065, 0.88, 0.07]} color={gold} />
          <Block position={[x * 1.05, -0.22, -0.1]} size={[0.5, 0.065, 0.07]} color={gold} />
        </group>
      ))}
    </group>
  );
}
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override render() {
    return this.state.failed ? <SceneFallback /> : this.props.children;
  }
}
export function SceneFallback() {
  return (
    <div className="scene-fallback" aria-label="Build, automate, and grow">
      <span>&lt;/&gt;</span>
      <span>✦</span>
      <span>↗</span>
    </div>
  );
}
export default function ClayScene({
  progress,
  reduced = false,
}: {
  progress: MutableRefObject<number>;
  reduced?: boolean;
}) {
  const holder = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(!!entry?.isIntersecting), {
      rootMargin: "100px",
    });
    if (holder.current) observer.observe(holder.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div className="clay-scene" ref={holder} aria-hidden="true">
      <SceneBoundary>
        <Canvas
          fallback={<SceneFallback />}
          shadows
          dpr={[1, 1.5]}
          camera={{ position: [4.2, 3.2, 9], fov: 37 }}
          frameloop={!visible ? "never" : reduced ? "demand" : "always"}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        >
          <ambientLight intensity={1.5} />
          <directionalLight
            position={[-3, 7, 5]}
            intensity={3.4}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <pointLight position={[5, 3, 2]} color="#ffe2a2" intensity={30} />
          <Suspense fallback={null}>
            <Sculpture progress={progress} animated={!reduced} />
          </Suspense>
        </Canvas>
      </SceneBoundary>
    </div>
  );
}
