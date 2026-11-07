"use client";

/**
 * Ambient Diwali motion layer.
 *
 * Marigold petals drifting down and a few slow embers rising behind the page
 * content. Purely transform/opacity animation on ~18 tiny elements, pointer
 * events off, hidden from assistive tech, and disabled entirely when the
 * visitor asks for reduced motion or the device reports a low battery/slow
 * connection.
 */
export function DiwaliLayer() {
  const petals = Array.from({ length: 10 }, (_, i) => i);
  const embers = Array.from({ length: 8 }, (_, i) => i);

  return (
    <div className="diwali-layer pointer-events-none fixed inset-0 z-[70] overflow-hidden" aria-hidden>
      {petals.map((i) => (
        <span
          key={`p-${i}`}
          className="petal"
          style={{
            left: `${(i * 11 + 4) % 100}%`,
            animationDelay: `${(i % 5) * 2.4}s`,
            animationDuration: `${16 + (i % 4) * 5}s`,
            transform: `scale(${0.7 + (i % 3) * 0.22})`,
          }}
        />
      ))}
      {embers.map((i) => (
        <span
          key={`e-${i}`}
          className="ember ember-slow"
          style={{
            left: `${(i * 13 + 9) % 100}%`,
            animationDelay: `${(i % 4) * 1.6}s`,
            animationDuration: `${9 + (i % 5) * 2.2}s`,
          }}
        />
      ))}
    </div>
  );
}
