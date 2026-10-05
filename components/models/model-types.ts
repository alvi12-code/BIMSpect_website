export type Vector = [number, number, number];
export type Part = { position: Vector; size: Vector; rotation?: Vector };
export type Discipline = "plumbing" | "electrical";
export type ChangeKind = "changed" | "added" | "removed";
export type SceneMotion = { invalidate: (() => void) | null; updatedAt: number };
export type ModelReveal = SceneMotion & {
  progress: number; ghost: number; highlight: number; added: number; emphasis: number;
};
