"use client";

import { useLayoutEffect, useRef } from "react";
import { BufferGeometry, InstancedMesh, Material, Object3D } from "three";
import type { Part } from "./model-types";

/** Repeated elements share one geometry/material and one draw call per batch. */
export function InstancedParts({ parts, geometry, material, name }: {
  parts: Part[]; geometry: BufferGeometry; material: Material; name: string;
}) {
  const ref = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const transform = new Object3D();
    parts.forEach((part, index) => {
      transform.position.set(...part.position);
      transform.scale.set(...part.size);
      transform.rotation.set(...(part.rotation ?? [0, 0, 0]));
      transform.updateMatrix();
      mesh.setMatrixAt(index, transform.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [parts]);
  return parts.length ? <instancedMesh name={name} ref={ref} args={[geometry, material, parts.length]} dispose={null} /> : null;
}
