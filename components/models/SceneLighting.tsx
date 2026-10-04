/** Soft architectural light shared by all three scenes; no shadows or HDR download. */
export function SceneLighting() {
  return <>
    <hemisphereLight args={["#f7f8ff", "#c5beb5", 1.5]} />
    <directionalLight position={[5, 9, 7]} intensity={2.6} color="#fff8ee" />
    <directionalLight position={[-5, 3, -2]} intensity={1.0} color="#e4e8ff" />
  </>;
}
