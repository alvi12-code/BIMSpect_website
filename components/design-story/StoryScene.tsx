"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  BoxGeometry,
  BufferGeometry,
  Color,
  EdgesGeometry,
  Float32BufferAttribute,
  LineDashedMaterial,
  LineSegments,
  MeshStandardMaterial,
  PerspectiveCamera,
  Vector3,
} from "three";
import { InstancedParts } from "@/components/models/InstancedParts";
import { useRenderBudget } from "@/components/models/useRenderBudget";
import type { Vector } from "@/components/models/model-types";
import { getStoryElements, type StoryElement } from "./story-data";
import { makeStoryArchitecture, makeStoryGrid } from "./story-geometry";
import { getStoryContextTreatment, getStoryElementTreatment, getStoryPreviousGeometry, isStoryInterfaceContext, resolveStoryRenderState, STORY_CONTEXT_LAYERS, type StoryRendererControls, type StoryRenderState } from "./story-rendering";

export type StorySceneProps = StoryRendererControls & {
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

function ArchitecturalContext({ state, compact }: { state: StoryRenderState; compact: boolean }) {
  const model = useMemo(() => makeStoryArchitecture(compact), [compact]);
  const grid = useMemo(() => makeStoryGrid(), []);
  const resources = useMemo(() => ({
    box: new BoxGeometry(1, 1, 1),
    layers: STORY_CONTEXT_LAYERS.map(layer => {
      const material = () => new MeshStandardMaterial({ color: COLORS[layer.surface],
        roughness: layer.surface === "glass" ? .23 : layer.discipline === "MEP" ? .48 : .7,
        metalness: layer.discipline === "MEP" || layer.discipline === "STR" ? .2 : .04 });
      return { focus: material(), surrounding: material() };
    }),
  }), []);
  const materialRef = useRef(resources);
  const batches = useMemo(() => STORY_CONTEXT_LAYERS.map(layer => ({
    focus: model[layer.key].filter(isStoryInterfaceContext),
    surrounding: model[layer.key].filter(part => !isStoryInterfaceContext(part)),
  })), [model]);

  // Changes in attention are material updates, not a permanent animation loop.
  useLayoutEffect(() => {
    const materials = materialRef.current;
    const pale = new Color("#e4dfd6");
    STORY_CONTEXT_LAYERS.forEach((layer, index) => {
      for (const key of ["focus", "surrounding"] as const) {
        const material = materials.layers[index][key];
        const treatment = getStoryContextTreatment(layer.discipline, layer.surface, key === "focus", state);
        material.color.set(COLORS[layer.surface]).lerp(pale, treatment.muted);
        const transparent = treatment.opacity < 1;
        if (material.transparent !== transparent) material.needsUpdate = true;
        material.transparent = transparent;
        material.depthWrite = !transparent;
        material.opacity = treatment.opacity;
      }
    });
  }, [state]);
  useEffect(() => () => {
    resources.box.dispose();
    resources.layers.forEach(layer => { layer.focus.dispose(); layer.surrounding.dispose(); });
  }, [resources]);

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
    </group>
    {STORY_CONTEXT_LAYERS.map((layer, index) => <group key={layer.key} name={`context-${layer.discipline ?? "site"}-${layer.key}`}>
      <InstancedParts name={`${layer.name}-interface`} parts={batches[index].focus} geometry={resources.box} material={resources.layers[index].focus} />
      <InstancedParts name={`${layer.name}-surrounding`} parts={batches[index].surrounding} geometry={resources.box} material={resources.layers[index].surrounding} />
    </group>)}
    <DrawingLines lines={model.floorEdges} color="#837f7a" opacity={state.modelView === "interface" || state.discipline !== "all" ? .045 : .2} />
  </group>;
}

function elementColor(element: StoryElement, state: StoryRenderState) {
  const treatment = getStoryElementTreatment(element, state);
  if (treatment.highlight === "selected" || treatment.highlight === "current") return COLORS.purple;
  if (treatment.highlight === "repeated") return element.revisionCount >= 3 ? COLORS.amber : COLORS.lightAmber;
  if (treatment.muted || state.viewMode === "history") return "#c7c5bf";
  if (element.kind === "panel") return COLORS.glass;
  if (element.kind === "partition") return COLORS.porcelain;
  if (element.kind === "beam") return COLORS.structure;
  return COLORS.duct;
}

function VersionedElements({ state, elements, onSelectElement }: {
  state: StoryRenderState;
  elements: StoryElement[];
  onSelectElement?: (id: string) => void;
}) {
  const geometry = useMemo(() => {
    const box = new BoxGeometry(1, 1, 1);
    return { box, edges: new EdgesGeometry(box) };
  }, []);
  useEffect(() => () => { geometry.box.dispose(); geometry.edges.dispose(); }, [geometry]);
  return <group name="illustrative-versioned-elements">
    {elements.map(element => {
      const { selected, emphasized, muted, highlight } = getStoryElementTreatment(element, state);
      const color = elementColor(element, state);
      const outlined = emphasized;
      return <group key={element.id} name={`story-element-${element.id}`} position={element.position} scale={element.size}>
        {/* The external extent always matches the shared fixture exactly. */}
        <mesh geometry={geometry.box} onClick={onSelectElement ? event => { event.stopPropagation(); onSelectElement(element.id); } : undefined}>
          <meshStandardMaterial
            color={color}
            roughness={element.kind === "panel" ? 0.28 : 0.58}
            metalness={element.kind === "beam" || element.kind === "duct" ? 0.18 : 0.04}
            emissive={color}
            emissiveIntensity={emphasized ? 0.055 : 0}
            transparent={muted || element.kind === "panel" && !emphasized}
            opacity={muted ? .18 : element.kind === "panel" && !emphasized ? .58 : 1}
            depthWrite={!muted && (element.kind !== "panel" || emphasized)}
          />
        </mesh>
        {outlined ? <lineSegments geometry={geometry.edges} renderOrder={3}>
          <lineBasicMaterial color={highlight === "repeated" ? "#9c6827" : "#674399"} transparent opacity={selected ? .96 : .63} toneMapped={false} />
        </lineSegments> : null}
      </group>;
    })}
  </group>;
}

function PreviousElementOutline({ element }: { element: StoryElement }) {
  const ref = useRef<LineSegments<EdgesGeometry, LineDashedMaterial>>(null);
  const geometry = useMemo(() => {
    const box = new BoxGeometry(...element.size);
    const edges = new EdgesGeometry(box);
    box.dispose();
    return edges;
  }, [element.size]);
  useLayoutEffect(() => { ref.current?.computeLineDistances(); }, [geometry]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <lineSegments ref={ref} name={`previous-geometry-${element.id}`} geometry={geometry} position={element.position} renderOrder={4}>
    {/* An earlier, smaller section may sit entirely inside the current solid.
        Its dashed comparison outline must remain visible, as in the SVG view. */}
    <lineDashedMaterial color="#655384" transparent opacity={.85} dashSize={.095} gapSize={.06} depthTest={false} depthWrite={false} toneMapped={false} />
  </lineSegments>;
}

type View = { position: Vector3; target: Vector3 };

function cameraView(camera: PerspectiveCamera, aspect: number, state: StoryRenderState): View {
  const focused = state.modelView === "interface";
  const target = focused ? new Vector3(3.45, 2.8, 2.6) : new Vector3(.55, 3.2, .6);
  const direction = new Vector3(focused ? 1.0 : 1.23, focused ? 1.15 : state.viewMode === "history" ? 1.02 : .8, 1.65).normalize();
  const right = new Vector3().crossVectors(new Vector3(0, 1, 0), direction).normalize();
  const up = new Vector3().crossVectors(direction, right).normalize();
  const tangent = Math.tan(camera.fov * Math.PI / 360);
  let distance = 0;
  // Project the eight building extents into the camera basis and fit both axes.
  // The ground drawing can crop naturally; the building stays inside the frame.
  for (const x of focused ? [.7, 6.7] : [-5.6, 6.7]) for (const y of focused ? [1.4, 3.95] : [-.35, 7.65]) for (const z of focused ? [.8, 4.8] : [-2.8, 4.7]) {
    const point = new Vector3(x, y, z).sub(target);
    const depth = point.dot(direction);
    distance = Math.max(distance,
      Math.abs(point.dot(up)) / tangent + depth,
      Math.abs(point.dot(right)) / (tangent * Math.max(aspect, 0.35)) + depth);
  }
  distance *= 1.075;
  return { position: target.clone().addScaledVector(direction, distance), target };
}

function SceneLifecycle({ state: renderState, active, reduced, onReady, onFailure }: Pick<StorySceneProps, "active" | "reduced" | "onReady" | "onFailure"> & { state: StoryRenderState }) {
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
    const next = cameraView(camera, size.width / size.height, renderState);
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
  }, [camera, size.width, size.height, renderState, active, reduced, invalidate]);

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
  const state = useMemo(() => resolveStoryRenderState(props.chapter, props.selectedElementId, {
    discipline: props.discipline, viewMode: props.viewMode, modelView: props.modelView,
  }), [props.chapter, props.selectedElementId, props.discipline, props.viewMode, props.modelView]);
  const previous = useMemo(() => getStoryPreviousGeometry(props.revision, props.selectedElementId, props.showPrevious), [props.revision, props.selectedElementId, props.showPrevious]);
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
    <SceneLifecycle {...props} state={state} />
    <ArchitecturalContext state={state} compact={compact} />
    <VersionedElements state={state} elements={elements} onSelectElement={props.onSelectElement} />
    {previous ? <PreviousElementOutline element={previous} /> : null}
  </Canvas>;
}

export default StoryScene;
