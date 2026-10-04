"use client";

import { Component, type ReactNode } from "react";

export class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error) {
    console.warn("BIMSpect: using an accessible static illustration because the 3D scene failed.", error);
    this.props.onFailure();
  }
  render() { return this.state.failed ? null : this.props.children; }
}
