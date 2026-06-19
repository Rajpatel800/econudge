"use client";

import { useEffect } from "react";

interface LeafStyle {
  left: string;
  width: string;
  height: string;
  animationDuration: string;
  animationDelay: string;
}

/** Generates a random set of CSS properties for a single leaf. */
function createLeafStyle(): LeafStyle {
  const leftPos = Math.random() * 100;
  const size = Math.random() * 10 + 10;
  const duration = Math.random() * 10 + 10;
  const delay = Math.random() * 10;
  return {
    left: `${leftPos}vw`,
    width: `${size}px`,
    height: `${size}px`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
  };
}

const LEAF_COUNT = 15;

/** Renders animated falling leaves in the background. */
export default function FloatingLeaves() {
  useEffect(() => {
    const container = document.getElementById("leaves-container");
    if (!container) return;

    const leaves: HTMLDivElement[] = [];

    function spawnLeaf(): void {
      if (!container) return;
      const leaf = document.createElement("div");
      leaf.classList.add("leaf");
      const style = createLeafStyle();
      Object.assign(leaf.style, style);
      container.appendChild(leaf);
      leaves.push(leaf);

      const totalMs =
        (parseFloat(style.animationDuration) +
          parseFloat(style.animationDelay)) *
        1000;

      setTimeout(() => {
        leaf.remove();
        spawnLeaf();
      }, totalMs);
    }

    for (let i = 0; i < LEAF_COUNT; i++) {
      spawnLeaf();
    }

    return () => {
      leaves.forEach((l) => l.remove());
    };
  }, []);

  return <div id="leaves-container" aria-hidden="true" />;
}
