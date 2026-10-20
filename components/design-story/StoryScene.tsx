"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  BoxGeometry,
  BufferGeometry,
  Color,
  EdgesGeometry,
  Float32BufferAttribute,
  MeshStandardMaterial,
  PerspectiveCamera,
  Vector3,
} from "three";
import { InstancedParts } from "@/components/models/InstancedParts";
import { useRenderBudget } from "@/components/models/useRenderBudget";
import type { Vector } from "@/components/models/model-types";
import { getStoryElements, type StoryElement } from "./story-data";
import { makeStoryArchitecture, makeStoryGrid } from "./story-geometry";

export type StorySceneProps = {
  chapter: number;
  revision: number;
  selectedElementId: string | null;
  active: boolean;
  reduced: boolean;
  onReady: () => void;
  onFailure: () => void;
};

const COLORS = {
  concrete: "#d5cfc3",
  porcelain: "#ebe6dd",
  fascia: "#f6f0e6",
  structure: "#56626b",
  frame: "#667680",
  glass: "#92aebc",
  duct: "#819fa4",
  service: "#697b88",
  plant: "#a8b0ad",
  detail: "#c7bdac",
  purple: "#9670dd",
  palePurple: "#b6a0d7",
  amber: "#d09a4b",
  lightAmber: "#d9b174",
} as const;

function lineGeometry(lines: Array<[Vector, Vector]>) {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(lines.flat(2), 3));
  geometry.computeBoundingSphere();
  return geometry;
}

function DrawingLines({ lines, color, opacity }: {
  lines: Array<[Vector, Vector]>;
  color: string;
  opacity: number;
}) {
  const geometry = useMemo(() => lineGeometry(lines), [lines]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <lineSegments geometry={geometry} renderOrder={1}>
    <lineBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} toneMapped={false} />
  </lineSegments>;
}

function ArchitecturalContext({ chapter, compact }: { chapter: number; compact: boolean }) {
  const model = useMemo(() => makeStoryArchitecture(compact), [compact]);
  const grid = useMemo(() => makeStoryGrid(), []);
  const resources = useMemo(() => ({
    box: new BoxGeometry(1, 1, 1),
    concrete: new MeshStandardMaterial({ color: COLORS.concrete, roughness: 0.88, metalness: 0.02 }),
    porcelain: new MeshStandardMaterial({ color: COLORS.porcelain, roughness: 0.72, metalness: 0.03 }),
    fascia: new MeshStandardMaterial({ color: COLORS.fascia, roughness: 0.65 }),
    structure: new MeshStandardMaterial({ color: COLORS.structure, roughness: 0.55, metalness: 0.24 }),
    frame: new MeshStandardMaterial({ color: COLORS.frame, roughness: 0.45, metalness: 0.28 }),
    glass: new MeshStandardMaterial({ color: COLORS.glass, roughness: 0.23, metalness: 0.12, transparent: true, opacity: 0.42, depthWrite: false }),
    duct: new MeshStandardMaterial({ color: COLORS.duct, roughness: 0.46, metalness: 0.26 }),
    service: new MeshStandardMaterial({ color: COLORS.service, roughness: 0.52, metalness: 0.26 }),
    plant: new MeshStandardMaterial({ color: COLORS.plant, roughness: 0.67, metalness: 0.16 }),
    detail: new MeshStandardMaterial({ color: COLORS.detail, roughness: 0.8 }),
  }), []);
  const materialRef = useRef(resources);

  // Changes in attention are material updates, not a permanent animation loop.
  useLayoutEffect(() => {
    const materials = materialRef.current;
    const focus = chapter === 3 ? 0.62 : chapter === 2 ? 0.31 : 0;
    const pale = new Color("#e4dfd6");
    for (const key of ["concrete", "porcelain", "fascia", "structure", "frame", "duct", "service", "plant", "detail"] as const) {
      materials[key].color.set(COLORS[key]).lerp(pale, focus);
    }
    materials.glass.color.set(COLORS.glass).lerp(pale, focus * 0.5);
    materials.glass.opacity = chapter === 3 ? 0.13 : chapter === 2 ? 0.24 : 0.42;
  }, [chapter]);
  useEffect(() => () => Object.values(resources).forEach(resource => resource.dispose()), [resources]);

  return <group name="six-level-architectural-context">
    <group name="site-and-model-datum">
      {/* A stack of very low-opacity planes produces a bounded soft contact
          shadow without a texture download, shadow map or render pass. */}
      {Array.from({ length: compact ? 8 : 14 }, (_, index) => {
        const spread = index / (compact ? 8 : 14);
        return <mesh key={index} position={[0.55, -0.355 - spread * 0.012, 1.05]} rotation={[-Math.PI / 2, 0, 0]} scale={[12.1 + spread * 3.0, 8.0 + spread * 2.5, 1]}>
          <circleGeometry args={[0.5, 48]} />
          <meshBasicMaterial color="#596473" transparent opacity={compact ? 0.026 : 0.015} depthWrite={false} toneMapped={false} />
        </mesh>;
      })}
      <mesh position={[0.55, -0.26, 1.05]}>
        <boxGeometry args={[13.4, 0.115, 9.6]} />
        <meshStandardMaterial color="#ddd7cc" roughness={0.98} />
      </mesh>
      <mesh position={[0.55, -0.185, 1.05]}>
        <boxGeometry args={[13.1, 0.035, 9.3]} />
        <meshStandardMaterial color="#eee9e0" roughness={0.98} />
      </mesh>
      <group position={[0, 0.16, 0]}><DrawingLines lines={grid} color="#647083" opacity={0.115} /></group>
      <InstancedParts name="site-paving-and-entrance-steps" parts={model.pavers} geometry={resources.box} material={resources.porcelain} />
    </group>
    <InstancedParts name="six-storey-l-shaped-slabs" parts={model.slabs} geometry={resources.box} material={resources.concrete} />
    <InstancedParts name="slab-section-fascias" parts={model.fascia} geometry={resources.box} material={resources.fascia} />
    <InstancedParts name="envelope-and-circulation-core" parts={model.walls} geometry={resources.box} material={resources.porcelain} />
    <InstancedParts name="structural-column-grid" parts={model.columns} geometry={resources.box} material={resources.structure} />
    <InstancedParts name="structural-floor-beams" parts={model.beams} geometry={resources.box} material={resources.structure} />
    <InstancedParts name="facade-mullions-and-roof-details" parts={model.frames} geometry={resources.box} material={resources.frame} />
    <InstancedParts name="switchback-stair-flights" parts={model.stairs} geometry={resources.box} material={resources.porcelain} />
    <InstancedParts name="atrium-and-stair-balustrades" parts={model.rails} geometry={resources.box} material={resources.frame} />
    <InstancedParts name="context-supply-and-return-ducts" parts={model.ducts} geometry={resources.box} material={resources.duct} />
    <InstancedParts name="context-service-routes" parts={model.services} geometry={resources.box} material={resources.service} />
    <InstancedParts name="rooftop-plant-and-diffusers" parts={model.plant} geometry={resources.box} material={resources.plant} />
    <InstancedParts name="interior-and-entrance-details" parts={model.details} geometry={resources.box} material={resources.detail} />
    <InstancedParts name="glazed-envelope-and-atrium" parts={model.glass} geometry={resources.box} material={resources.glass} />
    <DrawingLines lines={model.floorEdges} color="#837f7a" opacity={chapter === 3 ? 0.11 : 0.23} />
  </group>;
}

function elementColor(element: StoryElement, chapter: number, selected: boolean) {
  if (chapter === 3) return selected ? COLORS.purple : "#c7c5bf";
  if (chapter === 2 || chapter === 4) {
    if (element.revisionCount >= 3) return COLORS.amber;
    if (element.revisionCount > 1) return COLORS.lightAmber;
    return "#b6bab9";
  }
  if (element.changedNow) return COLORS.purple;
  if (element.kind === "panel") return COLORS.glass;
  if (element.kind === "partition") return COLORS.porcelain;
  if (element.kind === "beam") return COLORS.structure;
  return COLORS.duct;
}

function VersionedElements({ chapter, elements, selectedElementId }: {
  chapter: number;
  elements: StoryElement[];
  selectedElementId: string | null;
}) {
  const geometry = useMemo(() => {
    const box = new BoxGeometry(1, 1, 1);
    return { box, edges: new EdgesGeometry(box) };
  }, []);
  useEffect(() => () => { geometry.box.dispose(); geometry.edges.dispose(); }, [geometry]);
  return <group name="illustrative-versioned-elements">
    {elements.map(element => {
      const selected = element.id === selectedElementId;
      const color = elementColor(element, chapter, selected);
      const emphasized = chapter === 2 || chapter === 4 ? element.revisionCount > 1 : chapter === 3 ? selected : element.changedNow;
      const outlined = emphasized;
      return <group key={element.id} name={`story-element-${element.id}`} position={element.position} scale={element.size}>
        {/* The external extent always matches the shared fixture exactly. */}
        <mesh geometry={geometry.box}>
          <meshStandardMaterial
            color={color}
            roughness={element.kind === "panel" ? 0.28 : 0.58}
            metalness={element.kind === "beam" || element.kind === "duct" ? 0.18 : 0.04}
            emissive={color}
            emissiveIntensity={emphasized ? 0.055 : 0}
            transparent={element.kind === "panel" && !emphasized}
            opacity={element.kind === "panel" && !emphasized ? 0.58 : 1}
            depthWrite={element.kind !== "panel" || emphasized}
          />
        </mesh>
        {outlined ? <lineSegments geometry={geometry.edges} renderOrder={3}>
          <lineBasicMaterial color={chapter === 2 || chapter === 4 ? "#9c6827" : "#674399"} transparent opacity={selected && chapter === 3 ? 0.96 : 0.63} toneMapped={false} />
        </lineSegments> : null}
      </group>;
    })}
  </group>;
}

type View = { position: Vector3; target: Vector3 };

function cameraView(camera: PerspectiveCamera, aspect: number, chapter: number, selected: StoryElement | undefined): View {
  const target = new Vector3(0.55, 3.2, 0.6);
  const direction = new Vector3(chapter === 1 ? 1.13 : 1.23, chapter === 2 ? 1.02 : 0.8, 1.65).normalize();
  const right = new Vector3().crossVectors(new Vector3(0, 1, 0), direction).normalize();
  const up = new Vector3().crossVectors(direction, right).normalize();
  const tangent = Math.tan(camera.fov * Math.PI / 360);
  let distance = 0;
  // Project the eight building extents into the camera basis and fit both axes.
  // The ground drawing can crop naturally; the building stays inside the frame.
  for (const x of [-5.6, 6.7]) for (const y of [-0.35, 7.65]) for (const z of [-2.8, 4.7]) {
    const point = new Vector3(x, y, z).sub(target);
    const depth = point.dot(direction);
    distance = Math.max(distance,
      Math.abs(point.dot(up)) / tangent + depth,
      Math.abs(point.dot(right)) / (tangent * Math.max(aspect, 0.35)) + depth);
  }
  distance *= 1.075;
  if (chapter === 3 && selected) {
    target.lerp(new Vector3(...selected.position), 0.43);
    distance *= 0.9;
  }
  return { position: target.clone().addScaledVector(direction, distance), target };
}

function SceneLifecycle({ chapter, revision, selectedElementId, active, reduced, onReady, onFailure }: StorySceneProps) {
  const { camera, gl, size, invalidate } = useThree();
  const announced = useRef(false);
  const callbacks = useRef({ onReady, onFailure });
  const view = useRef({
    initialized: false,
    running: false,
    elapsed: 0,
    fromPosition: new Vector3(),
    fromTarget: new Vector3(),
    toPosition: new Vector3(),
    toTarget: new Vector3(),
    currentTarget: new Vector3(),
  });
  useLayoutEffect(() => { callbacks.current = { onReady, onFailure }; }, [onReady, onFailure]);

  useEffect(() => {
    const canvas = gl.domElement;
    const handleContextLoss = (event: Event) => {
      event.preventDefault();
      view.current.running = false;
      callbacks.current.onFailure();
    };
    canvas.addEventListener("webglcontextlost", handleContextLoss);
    return () => canvas.removeEventListener("webglcontextlost", handleContextLoss);
  }, [gl]);

  useLayoutEffect(() => {
    if (!(camera instanceof PerspectiveCamera) || size.width <= 0 || size.height <= 0) return;
    const selected = getStoryElements(revision).find(element => element.id === selectedElementId);
    const next = cameraView(camera, size.width / size.height, chapter, selected);
    const state = view.current;
    state.fromPosition.copy(camera.position);
    state.fromTarget.copy(state.currentTarget);
    state.toPosition.copy(next.position);
    state.toTarget.copy(next.target);
    state.elapsed = 0;
    state.running = state.initialized && active && !reduced && (
      camera.position.distanceToSquared(next.position) > 0.0001 || state.currentTarget.distanceToSquared(next.target) > 0.0001
    );
    if (!state.running) {
      camera.position.copy(next.position);
      state.currentTarget.copy(next.target);
      camera.lookAt(next.target);
    }
    state.initialized = true;
    if (active) invalidate();
  }, [camera, size.width, size.height, chapter, revision, selectedElementId, active, reduced, invalidate]);

  useFrame((_, delta) => {
    if (!active || size.width <= 0 || size.height <= 0) return;
    const state = view.current;
    if (state.running) {
      state.elapsed += Math.min(delta, 0.05);
      const progress = Math.min(1, state.elapsed / 0.68);
      const eased = 1 - Math.pow(1 - progress, 3);
      camera.position.lerpVectors(state.fromPosition, state.toPosition, eased);
      state.currentTarget.lerpVectors(state.fromTarget, state.toTarget, eased);
      camera.lookAt(state.currentTarget);
      state.running = progress < 1;
      if (state.running) invalidate();
    }
    if (!announced.current) {
      announced.current = true;
      callbacks.current.onReady();
    }
  });
  return null;
}

export function StoryScene(props: StorySceneProps) {
  const compact = useRenderBudget();
  const elements = useMemo(() => getStoryElements(props.revision), [props.revision]);
  return <Canvas
    camera={{ position: [15, 12, 20], fov: 32, near: 0.1, far: 100 }}
    dpr={compact ? 1 : [1, 1.5]}
    frameloop={props.active ? "demand" : "never"}
    gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
    resize={{ scroll: false }}
    aria-hidden="true"
  >
    <hemisphereLight args={["#fffaf2", "#afb6c3", 1.55]} />
    <directionalLight position={[4, 12, 7]} intensity={2.65} color="#fff7e9" />
    <directionalLight position={[-7, 5, -4]} intensity={1.15} color="#d8e4ff" />
    <directionalLight position={[2, 3, -7]} intensity={0.5} color="#e8e9f6" />
    <SceneLifecycle {...props} />
    <ArchitecturalContext chapter={props.chapter} compact={compact} />
    <VersionedElements chapter={props.chapter} elements={elements} selectedElementId={props.selectedElementId} />
  </Canvas>;
}

export default StoryScene;
