"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { BoxGeometry, Color, CylinderGeometry, Group, MeshStandardMaterial } from "three";
import { InstancedParts } from "./InstancedParts";
import { SceneLighting } from "./SceneLighting";
import { useSceneInvalidation } from "./useSceneInvalidation";
import { makeDisciplineGeometry } from "./model-geometry";
import { CHANGE_PALETTE } from "./change-palette";
import { smoothRange } from "../hero/hero-motion";
import type { Discipline, ModelReveal } from "./model-types";

type Props = {
  discipline: Discipline; motion: RefObject<ModelReveal>; active: boolean;
  onReady: () => void; onFailure: () => void;
};
const NEUTRAL = new Color(CHANGE_PALETTE.normal), MUTED = new Color(CHANGE_PALETTE.muted);
const ACCENT = new Color(CHANGE_PALETTE.changed), GHOST = new Color(CHANGE_PALETTE.removed);

function Illustration({ discipline, motion, active, onReady, onFailure }: Props) {
  const { camera, gl, size } = useThree();
  useSceneInvalidation(motion, active);
  const after = useRef<Group>(null), revisedContext = useRef<Group>(null);
  const mobile = size.width < 500;
  const model = useMemo(() => makeDisciplineGeometry(discipline, mobile), [discipline, mobile]);
  const resources = useMemo(() => ({
    box: new BoxGeometry(1, 1, 1), pipe: new CylinderGeometry(1, 1, 1, 10),
    normal: new MeshStandardMaterial({ color: NEUTRAL, metalness: 0.2, roughness: 0.58 }),
    context: new MeshStandardMaterial({ color: "#d4d6d4", roughness: 0.95 }),
    revised: new MeshStandardMaterial({ color: "#bcc2c5", transparent: true, opacity: 0, roughness: 0.95 }),
    fixture: new MeshStandardMaterial({ color: "#88939b", metalness: 0.2, roughness: 0.65 }),
    removed: new MeshStandardMaterial({ color: NEUTRAL, transparent: true, opacity: 1, depthWrite: false, roughness: 0.6 }),
    added: new MeshStandardMaterial({ color: CHANGE_PALETTE.added, transparent: true, opacity: 0, roughness: 0.55 }),
    changed: new MeshStandardMaterial({ color: NEUTRAL, transparent: true, opacity: 0, roughness: 0.55 })
  }), []);
  const animated = useRef(resources);
  useEffect(() => () => Object.values(resources).forEach(resource => resource.dispose()), [resources]);
  useEffect(() => {
    onReady();
    const canvas = gl.domElement;
    const lost = (event: Event) => { event.preventDefault(); onFailure(); };
    canvas.addEventListener("webglcontextlost", lost);
    return () => canvas.removeEventListener("webglcontextlost", lost);
  }, [gl, onReady, onFailure]);
  useFrame(() => {
    const p = motion.current.progress, t = smoothRange(p, 0.18, 0.7), highlight = smoothRange(p, 0.5, 0.85);
    const r = animated.current;
    r.normal.color.copy(NEUTRAL).lerp(MUTED, highlight * 0.35);
    r.removed.color.copy(NEUTRAL).lerp(GHOST, t); r.removed.opacity = 1 - t * 0.88;
    r.changed.opacity = t; r.changed.color.copy(NEUTRAL).lerp(ACCENT, highlight);
    r.added.opacity = smoothRange(p, 0.38, 0.72); r.revised.opacity = t;
    if (after.current) after.current.visible = t > 0.001;
    if (revisedContext.current) revisedContext.current.visible = t > 0.001;
    const fit = Math.max(1, 1.1 / (size.width / size.height));
    const settle = 1 - smoothRange(p, 0, 0.25) * 0.025;
    camera.position.set(7.8 * fit * settle, 6.0 * fit * settle, 10.2 * fit * settle);
    camera.lookAt(0, 0, 0);
    // The shared invalidation hook sleeps after the bounded transition tail.
  });
  const geometry = model.shape === "pipe" ? resources.pipe : resources.box;
  return <group position={[0, -model.centerY, 0]} name={`${discipline}-room`}>
    <InstancedParts name="unchanged-services" parts={model.normal} geometry={geometry} material={resources.normal} />
    <InstancedParts name="room-slabs-walls-columns" parts={model.context} geometry={resources.box} material={resources.context} />
    <InstancedParts name="pump-panel-supports" parts={model.fixtures} geometry={resources.box} material={resources.fixture} />
    <group ref={revisedContext}><InstancedParts name="new-partition-context" parts={model.revisedContext} geometry={resources.box} material={resources.revised} /></group>
    {model.changes.map((change, i) => <InstancedParts key={i} name={`old-route-${i}`} parts={change.before} geometry={geometry} material={resources.removed} />)}
    <group ref={after}>{model.changes.map((change, i) => <InstancedParts key={i} name={`new-route-${i}`} parts={change.after} geometry={geometry} material={change.kind === "added" ? resources.added : resources.changed} />)}</group>
  </group>;
}
export default function ModelCanvas(props: Props) {
  return <Canvas camera={{ position: [7.8, 6, 10.2], fov: 34, near: 0.1, far: 60 }}
    dpr={[1, 1.5]} frameloop="demand" gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
    resize={{ scroll: false }} fallback={<span />}>
    <SceneLighting /><Illustration {...props} />
  </Canvas>;
}
