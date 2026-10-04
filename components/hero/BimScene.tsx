"use client";

import { useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { HeroExperienceContent } from "@/content/home";
import { SceneLighting } from "@/components/models/SceneLighting";
import { useSceneInvalidation } from "@/components/models/useSceneInvalidation";
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

function ResponsiveBuilding({ motion }: { motion: MotionRef }) {
  const { size } = useThree();
  return <BimBuilding motion={motion} mobile={size.width < 560} />;
}

function SceneLifecycle({ motion, active, reduced, onReady, onFailure }: Omit<Props, "content">) {
  const { camera, gl, size } = useThree();
  useSceneInvalidation(motion, active, reduced);
  useEffect(() => {
    onReady();
    const canvas = gl.domElement;
    const onContextLost = (event: Event) => { event.preventDefault(); onFailure(); };
    canvas.addEventListener("webglcontextlost", onContextLost);
    return () => {
      canvas.removeEventListener("webglcontextlost", onContextLost);
    };
  }, [gl, onReady, onFailure]);

  useFrame(() => {
    const fit = Math.max(1, 1 / (size.width / size.height));
    const progress = motion.current.progress;
    const zoom = fit * (1 - smoothRange(progress, 0.16, 0.45) * 0.07);
    camera.position.set((10.3 - smoothRange(progress, 0.55, 0.8) * 0.35) * zoom, 6.8 * zoom, 14.4 * zoom);
    camera.lookAt(0, 0, 0);
    // The shared invalidation hook renders only during active scroll updates.
  });
  return null;
}

export default function BimScene(props: Props) {
  return (
    <Canvas
      camera={{ position: [10.7, 6.4, 14.8], fov: 34, near: 0.1, far: 80 }}
      dpr={[1, 1.5]}
      frameloop="demand"
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      fallback={<span>{props.content.sceneDescription}</span>}
      resize={{ scroll: false }}
    >
      <SceneLighting />
      <SceneLifecycle {...props} />
      <ResponsiveBuilding motion={props.motion} />
    </Canvas>
  );
}
