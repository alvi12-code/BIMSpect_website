"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BoxGeometry, Color, Group, MeshStandardMaterial } from "three";
import { InstancedParts } from "@/components/models/InstancedParts";
import { CHANGE_PALETTE } from "@/components/models/change-palette";
import { changeProgress, smoothRange, type MotionRef } from "./hero-motion";
import { makeBuilding } from "./bim-geometry";

const NEUTRAL = new Color(CHANGE_PALETTE.normal), MUTED = new Color(CHANGE_PALETTE.muted);
const ACCENT = new Color(CHANGE_PALETTE.changed), GHOST = new Color(CHANGE_PALETTE.removed);
export function BimBuilding({ motion, mobile }: { motion: MotionRef; mobile: boolean }) {
  const changes = useRef<Array<Group | null>>([]);
  const model = useMemo(() => makeBuilding(mobile), [mobile]);
  const resources = useMemo(() => ({
    box: new BoxGeometry(1, 1, 1),
    normal: new MeshStandardMaterial({ color: NEUTRAL, roughness: 0.72, metalness: 0.1 }),
    slab: new MeshStandardMaterial({ color: "#acb2b6", roughness: 0.9 }),
    glass: new MeshStandardMaterial({ color: "#8096a7", roughness: 0.32, metalness: 0.3 }),
    changed: new MeshStandardMaterial({ color: NEUTRAL, roughness: 0.58 }),
    added: new MeshStandardMaterial({ color: CHANGE_PALETTE.added, transparent: true, opacity: 0, roughness: 0.65 }),
    removed: new MeshStandardMaterial({ color: NEUTRAL, transparent: true, opacity: 1, depthWrite: false, roughness: 0.7 })
  }), []);
  const animated = useRef(resources);
  useEffect(() => () => Object.values(resources).forEach(resource => resource.dispose()), [resources]);
  useFrame(() => {
    const t = changeProgress(motion.current.progress), highlight = smoothRange(motion.current.progress, 0.44, 0.6);
    const r = animated.current;
    r.normal.color.copy(NEUTRAL).lerp(MUTED, highlight * 0.4);
    r.changed.color.copy(NEUTRAL).lerp(ACCENT, highlight);
    r.added.opacity = t;
    r.removed.opacity = 1 - t * 0.88;
    r.removed.color.copy(NEUTRAL).lerp(GHOST, t);
    model.changes.forEach((change, i) => {
      const element = changes.current[i];
      if (!element || !change.after.length) return;
      const a = change.before[0] ?? change.after[0], b = change.after[0];
      element.position.set(...a.position.map((value, axis) => value + (b.position[axis] - value) * t) as [number, number, number]);
      element.scale.set(...a.size.map((value, axis) => value + (b.size[axis] - value) * t) as [number, number, number]);
      element.visible = change.kind !== "added" || t > 0.001;
    });
  });
  return <group position={[-0.1, -3.1, 0]} scale={0.4} name="architectural-office">
    <InstancedParts name="floor-slabs-and-roofs" parts={model.slabs} geometry={resources.box} material={resources.slab} />
    <InstancedParts name="facade-walls" parts={model.walls} geometry={resources.box} material={resources.normal} />
    <InstancedParts name="columns" parts={model.columns} geometry={resources.box} material={resources.normal} />
    <InstancedParts name="glazing" parts={model.glass} geometry={resources.box} material={resources.glass} />
    <InstancedParts name="stair-core" parts={model.core} geometry={resources.box} material={resources.normal} />
    <InstancedParts name="partitions-entrance" parts={model.details} geometry={resources.box} material={resources.glass} />
    {model.changes.map((change, i) => <group key={change.name} name={change.name}>
      {change.kind === "removed" ? <InstancedParts name="removed-canopy" parts={change.before} geometry={resources.box} material={resources.removed} /> :
        <group ref={el => { changes.current[i] = el; }} position={(change.before[0] ?? change.after[0]).position} scale={(change.before[0] ?? change.after[0]).size}>
          <mesh geometry={resources.box} material={change.kind === "added" ? resources.added : resources.changed} dispose={null} />
        </group>}
    </group>)}
  </group>;
}
