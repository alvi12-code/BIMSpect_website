"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { BoxGeometry, Color, CylinderGeometry, Group, MeshStandardMaterial } from "three";
import { InstancedParts } from "./InstancedParts";
import { SceneLighting } from "./SceneLighting";
import { useSceneInvalidation } from "./useSceneInvalidation";
import { useRenderBudget } from "./useRenderBudget";
import { ComparisonEdges } from "./ComparisonEdges";
import { makeDisciplineGeometry } from "./model-geometry";
import { CHANGE_PALETTE } from "./change-palette";
import { smoothRange } from "../hero/hero-motion";
import type { Discipline, ModelReveal } from "./model-types";

type Props = {
  discipline: Discipline; motion: RefObject<ModelReveal>; active: boolean; reduced: boolean;
  onReady: () => void; onFailure: () => void;
};
const NEUTRAL = new Color(CHANGE_PALETTE.normal), MUTED = new Color(CHANGE_PALETTE.muted);
const ACCENT = new Color(CHANGE_PALETTE.changed), GHOST = new Color(CHANGE_PALETTE.removed);
const newContextColor = new Color("#f0efea");

function Illustration({ discipline, motion, active, reduced, onReady, onFailure, compact }: Props & { compact: boolean }) {
  const { camera, gl, size } = useThree();
  useSceneInvalidation(motion, active, reduced);
  const announced = useRef(false);
  const after = useRef<Group>(null), revisedContext = useRef<Group>(null);
  const mobile = compact || size.width < 500;
  const model = useMemo(() => makeDisciplineGeometry(discipline, mobile), [discipline, mobile]);
  const resources = useMemo(() => ({
    box: new BoxGeometry(1, 1, 1), pipe: new CylinderGeometry(1, 1, 1, 10),
    normal: new MeshStandardMaterial({ color: NEUTRAL, metalness: 0.2, roughness: 0.58 }),
    context: new MeshStandardMaterial({ color: "#d4d6d4", roughness: 0.95 }),
    revised: new MeshStandardMaterial({ color: "#bcc2c5", transparent: true, opacity: 0, roughness: 0.95 }),
    fixture: new MeshStandardMaterial({ color: "#88939b", metalness: 0.2, roughness: 0.65 }),
    removed: new MeshStandardMaterial({ color: NEUTRAL, transparent: true, opacity: 1, depthWrite: false, roughness: 0.6 }),
    added: new MeshStandardMaterial({ color: CHANGE_PALETTE.added, transparent: true, opacity: 0, roughness: 0.55, emissive: CHANGE_PALETTE.added, toneMapped: false }),
    changed: new MeshStandardMaterial({ color: NEUTRAL, transparent: true, opacity: 0, roughness: 0.55, emissive: ACCENT, toneMapped: false })
  }), []);
  const animated = useRef(resources);
  useEffect(() => () => Object.values(resources).forEach(resource => resource.dispose()), [resources]);
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => { event.preventDefault(); onFailure(); };
    canvas.addEventListener("webglcontextlost", lost);
    return () => canvas.removeEventListener("webglcontextlost", lost);
  }, [gl, onFailure]);
  useFrame(() => {
    if (size.width <= 0 || size.height <= 0) return;
    const controls = motion.current, t = smoothRange(controls.progress, 0, 1), highlight = controls.highlight;
    const r = animated.current;
    r.normal.color.copy(NEUTRAL).lerp(MUTED, highlight * 0.35);
    r.context.color.set("#d4d6d4").lerp(newContextColor, highlight * 0.45);
    r.removed.color.copy(NEUTRAL).lerp(GHOST, controls.ghost); r.removed.opacity = 1 - controls.ghost * 0.72;
    r.changed.opacity = t; r.changed.color.copy(NEUTRAL).lerp(ACCENT, highlight);
    r.changed.emissiveIntensity = highlight * (0.03 + controls.emphasis * 0.12);
    r.added.emissiveIntensity = controls.emphasis * 0.1;
    r.added.opacity = controls.added; r.revised.opacity = controls.ghost;
    if (after.current) after.current.visible = t > 0.001;
    if (revisedContext.current) revisedContext.current.visible = controls.ghost > 0.001;
    const fit = Math.max(1, 1.1 / (size.width / size.height));
    const settle = 1 - (reduced ? 0 : t * 0.02);
    camera.position.set(7.8 * fit * settle, 6.0 * fit * settle, 10.2 * fit * settle);
    camera.lookAt(0, 0, 0);
    if (!announced.current) { announced.current = true; onReady(); }
    // The shared invalidation hook sleeps after the bounded transition tail.
  });
  const geometry = model.shape === "pipe" ? resources.pipe : resources.box;
  return <group position={[0, -model.centerY, 0]} name={`${discipline}-room`}>
    <InstancedParts name="unchanged-services" parts={model.normal} geometry={geometry} material={resources.normal} />
    <InstancedParts name="room-slabs-walls-columns" parts={model.context} geometry={resources.box} material={resources.context} />
    <InstancedParts name="pump-panel-supports" parts={model.fixtures} geometry={resources.box} material={resources.fixture} />
    <group ref={revisedContext}><InstancedParts name="new-partition-context" parts={model.revisedContext} geometry={resources.box} material={resources.revised} /></group>
    {model.changes.map((change, i) => <group key={i}>
      <InstancedParts name={`old-route-${i}`} parts={change.before} geometry={geometry} material={resources.removed} />
      <ComparisonEdges parts={change.before} shape={model.shape} kind="removed" motion={motion} />
    </group>)}
    <group ref={after}>{model.changes.map((change, i) => <group key={i}>
      <InstancedParts name={`new-route-${i}`} parts={change.after} geometry={geometry} material={change.kind === "added" ? resources.added : resources.changed} />
      <ComparisonEdges parts={change.after} shape={model.shape} kind={change.kind} motion={motion} />
    </group>)}</group>
  </group>;
}
export default function ModelCanvas(props: Props) {
  const compact = useRenderBudget();
  return <Canvas camera={{ position: [7.8, 6, 10.2], fov: 34, near: 0.1, far: 60 }}
    dpr={compact ? 1 : [1, 1.5]} frameloop="demand" gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
    resize={{ scroll: false }}>
    <SceneLighting /><Illustration {...props} compact={compact} />
  </Canvas>;
}
