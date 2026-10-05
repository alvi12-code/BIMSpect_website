"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { BoxGeometry, BufferGeometry, EdgesGeometry, Float32BufferAttribute, LineDashedMaterial, LineSegments, Object3D, Vector3 } from "three";
import { CHANGE_PALETTE } from "./change-palette";
import type { ChangeKind, ModelReveal, Part } from "./model-types";

/** One lightweight edge batch per change group. Old pipes use dashed
 * centerlines, not a dense wireframe; added parts keep a clear solid boundary.
 */
export function ComparisonEdges({ parts, shape = "box", kind, motion }: {
  parts: Part[]; shape?: "box" | "pipe"; kind: ChangeKind; motion: RefObject<ModelReveal>;
}) {
  const ref = useRef<LineSegments<BufferGeometry, LineDashedMaterial>>(null);
  const geometry = useMemo(() => {
    const box = new BoxGeometry(1, 1, 1), edges = new EdgesGeometry(box);
    const unit = shape === "pipe" ? new Float32Array([0, -0.5, 0, 0, 0.5, 0]) : edges.attributes.position.array;
    const values: number[] = [], transform = new Object3D(), point = new Vector3();
    for (const part of parts) {
      transform.position.set(...part.position); transform.scale.set(...part.size);
      transform.rotation.set(...(part.rotation ?? [0, 0, 0])); transform.updateMatrix();
      for (let i = 0; i < unit.length; i += 3) {
        point.set(unit[i], unit[i + 1], unit[i + 2]).applyMatrix4(transform.matrix);
        values.push(point.x, point.y, point.z);
      }
    }
    edges.dispose(); box.dispose();
    const result = new BufferGeometry();
    result.setAttribute("position", new Float32BufferAttribute(values, 3));
    result.computeBoundingSphere();
    return result;
  }, [parts, shape]);
  useLayoutEffect(() => { ref.current?.computeLineDistances(); }, [geometry]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame(() => {
    if (!ref.current) return;
    const p = motion.current;
    ref.current.material.opacity = kind === "removed" ? p.ghost * 0.85 : kind === "added" ? p.added * 0.85 : p.highlight * 0.65;
  });
  return parts.length ? <lineSegments ref={ref} geometry={geometry}>
    <lineDashedMaterial color={kind === "added" ? "#006487" : kind === "changed" ? "#8d201a" : CHANGE_PALETTE.removed}
      transparent opacity={0} depthWrite={false} dashSize={kind === "removed" ? 0.12 : 1000} gapSize={kind === "removed" ? 0.08 : 0}
      toneMapped={false} />
  </lineSegments> : null;
}
