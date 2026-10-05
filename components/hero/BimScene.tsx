"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { HeroExperienceContent } from "@/content/home";
import { SceneLighting } from "@/components/models/SceneLighting";
import { useSceneInvalidation } from "@/components/models/useSceneInvalidation";
import { useRenderBudget } from "@/components/models/useRenderBudget";
import { BimBuilding } from "./BimBuilding";
import { smoothRange, type MotionRef } from "./hero-motion";

type Props = {
  motion: MotionRef;
  content: HeroExperienceContent;
  active: boolean;
  reduced: boolean;
  onReady: () => void;
  onFailure: () => void;
};

function ResponsiveBuilding({ motion, compact }: { motion: MotionRef; compact: boolean }) {
  const { size } = useThree();
  return <BimBuilding motion={motion} mobile={compact || size.width < 560} />;
}

function SceneLifecycle({ motion, active, reduced, onReady, onFailure }: Omit<Props, "content">) {
  const { camera, gl, size } = useThree();
  const announced = useRef(false);
  useSceneInvalidation(motion, active, reduced);
  useEffect(() => {
    const canvas = gl.domElement;
    const onContextLost = (event: Event) => { event.preventDefault(); onFailure(); };
    canvas.addEventListener("webglcontextlost", onContextLost);
    return () => {
      canvas.removeEventListener("webglcontextlost", onContextLost);
    };
  }, [gl, onFailure]);

  useFrame(() => {
    if (size.width <= 0 || size.height <= 0) return;
    const fit = Math.max(1, 1 / (size.width / size.height));
    const progress = motion.current.progress;
    const zoom = fit * (1 - (reduced ? 0 : smoothRange(progress, 0, 1) * 0.05));
    camera.position.set((10.3 - (reduced ? 0 : smoothRange(progress, 0, 1) * 0.25)) * zoom, 6.8 * zoom, 14.4 * zoom);
    camera.lookAt(0, 0, 0);
    if (!announced.current) { announced.current = true; onReady(); }
    // The shared invalidation hook renders only during active scroll updates.
  });
  return null;
}

export default function BimScene(props: Props) {
  const compact = useRenderBudget();
  return (
    <Canvas
      camera={{ position: [10.7, 6.4, 14.8], fov: 34, near: 0.1, far: 80 }}
      dpr={compact ? 1 : [1, 1.5]}
      frameloop="demand"
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      resize={{ scroll: false }}
    >
      <SceneLighting />
      <SceneLifecycle {...props} />
      <ResponsiveBuilding motion={props.motion} compact={compact} />
    </Canvas>
  );
}
