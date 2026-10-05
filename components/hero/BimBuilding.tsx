"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BoxGeometry, Color, Group, MeshStandardMaterial } from "three";
import { InstancedParts } from "@/components/models/InstancedParts";
import { CHANGE_PALETTE } from "@/components/models/change-palette";
import { ComparisonEdges } from "@/components/models/ComparisonEdges";
import { changeProgress, type MotionRef } from "./hero-motion";
import { makeBuilding } from "./bim-geometry";

const NEUTRAL = new Color("#e7e1d5"), MUTED = new Color("#f2eee7");
const ACCENT = new Color(CHANGE_PALETTE.changed), GHOST = new Color(CHANGE_PALETTE.removed);
const GLASS = new Color("#7697a8"), GRAPHITE = new Color("#37434a"), SOFT_STRUCTURE = new Color("#899298");
const UNIT = [{ position: [0, 0, 0] as [number, number, number], size: [1, 1, 1] as [number, number, number] }];
export function BimBuilding({ motion, mobile }: { motion: MotionRef; mobile: boolean }) {
  const changes = useRef<Array<Group | null>>([]);
  const model = useMemo(() => makeBuilding(mobile), [mobile]);
  const resources = useMemo(() => ({
    box: new BoxGeometry(1, 1, 1),
    normal: new MeshStandardMaterial({ color: NEUTRAL, roughness: 0.72, metalness: 0.1 }),
    slab: new MeshStandardMaterial({ color: "#c9c5bc", roughness: 0.9 }),
    structure: new MeshStandardMaterial({ color: "#37434a", roughness: 0.65, metalness: 0.2 }),
    glass: new MeshStandardMaterial({ color: "#7697a8", roughness: 0.32, metalness: 0.15, transparent: true, opacity: 0.85, depthWrite: false }),
    changed: new MeshStandardMaterial({ color: NEUTRAL, roughness: 0.65, emissive: ACCENT, toneMapped: false }),
    changedGlass: new MeshStandardMaterial({ color: GLASS, roughness: 0.45, emissive: ACCENT, toneMapped: false }),
    added: new MeshStandardMaterial({ color: CHANGE_PALETTE.added, transparent: true, opacity: 0, roughness: 0.65, emissive: CHANGE_PALETTE.added, toneMapped: false }),
    removed: new MeshStandardMaterial({ color: NEUTRAL, transparent: true, opacity: 1, depthWrite: false, roughness: 0.7 })
  }), []);
  const animated = useRef(resources);
  useEffect(() => {
    const glass = animated.current.glass;
    glass.transparent = !mobile; glass.depthWrite = mobile; glass.needsUpdate = true;
  }, [mobile]);
  useEffect(() => () => Object.values(resources).forEach(resource => resource.dispose()), [resources]);
  useFrame(() => {
    const controls = motion.current, t = changeProgress(controls.progress), highlight = controls.highlight;
    const r = animated.current;
    r.normal.color.copy(NEUTRAL).lerp(MUTED, highlight * 0.7);
    r.changed.color.copy(NEUTRAL).lerp(ACCENT, highlight);
    r.changedGlass.color.copy(GLASS).lerp(ACCENT, highlight);
    r.structure.color.copy(GRAPHITE).lerp(SOFT_STRUCTURE, highlight * 0.4);
    r.changed.emissiveIntensity = highlight * (0.03 + controls.emphasis * 0.12);
    r.changedGlass.emissiveIntensity = r.changed.emissiveIntensity;
    r.added.emissiveIntensity = controls.emphasis * 0.1;
    r.added.opacity = controls.added;
    r.glass.opacity = mobile ? 1 : 0.85 - highlight * 0.2;
    r.removed.opacity = 1 - controls.ghost * 0.72;
    r.removed.color.copy(NEUTRAL).lerp(GHOST, controls.ghost);
    model.changes.forEach((change, i) => {
      const element = changes.current[i];
      if (!element || !change.after.length) return;
      const a = change.before[0] ?? change.after[0], b = change.after[0];
      element.position.set(...a.position.map((value, axis) => value + (b.position[axis] - value) * t) as [number, number, number]);
      element.scale.set(...a.size.map((value, axis) => value + (b.size[axis] - value) * t) as [number, number, number]);
      element.visible = change.kind !== "added" || controls.added > 0.001;
    });
  });
  return <group position={[-0.1, -3.1, 0]} scale={0.4} name="architectural-office">
    <InstancedParts name="floor-slabs-and-roofs" parts={model.slabs} geometry={resources.box} material={resources.slab} />
    <InstancedParts name="facade-walls" parts={model.walls} geometry={resources.box} material={resources.normal} />
    <InstancedParts name="columns" parts={model.columns} geometry={resources.box} material={resources.structure} />
    <InstancedParts name="glazing" parts={model.glass} geometry={resources.box} material={resources.glass} />
    <InstancedParts name="stair-core" parts={model.core} geometry={resources.box} material={resources.normal} />
    <InstancedParts name="partitions-entrance" parts={model.details} geometry={resources.box} material={resources.glass} />
    {model.changes.map((change, i) => <group key={change.name} name={change.name}>
      {change.kind === "removed" ? <InstancedParts name="removed-canopy" parts={change.before} geometry={resources.box} material={resources.removed} /> :
        <group ref={el => { changes.current[i] = el; }} position={(change.before[0] ?? change.after[0]).position} scale={(change.before[0] ?? change.after[0]).size}>
          <mesh geometry={resources.box} material={change.kind === "added" ? resources.added : change.name === "window" || change.name === "door" ? resources.changedGlass : resources.changed} dispose={null} />
          <ComparisonEdges parts={UNIT} kind={change.kind} motion={motion} />
        </group>}
      {change.before.length > 0 ? <ComparisonEdges parts={change.before} kind="removed" motion={motion} /> : null}
    </group>)}
  </group>;
}
