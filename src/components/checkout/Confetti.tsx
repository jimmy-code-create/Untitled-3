"use client";

import { useEffect, useState } from "react";

const COLORS = ["#C98B6B", "#E3B08F", "#F29A2E", "#E9E4F5", "#B8892F", "#D8C7EE"];

export function Confetti() {
  const [pieces, setPieces] = useState<{ id: number; left: number; delay: number; duration: number; color: string; size: number; rotate: number }[]>([]);

  useEffect(() => {
    setPieces(
      Array.from({ length: 110 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 1.2,
        duration: 2.8 + Math.random() * 2.4,
        color: COLORS[i % COLORS.length],
        size: 4 + Math.random() * 6,
        rotate: Math.random() * 360,
      })),
    );
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[70] overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-[-24px] block"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.45,
            backgroundColor: p.color,
            transform: `rotate(${p.rotate}deg)`,
            animation: `confetti-fall ${p.duration}s linear ${p.delay}s forwards`,
            opacity: 0.9,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          8% {
            opacity: 1;
          }
          100% {
            transform: translateY(105vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
