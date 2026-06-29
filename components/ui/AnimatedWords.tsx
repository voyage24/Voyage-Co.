"use client";

// Renders text word-by-word with a staggered rise-in. `start` offsets the
// delay so multiple lines can cascade in sequence.
export default function AnimatedWords({ text, start = 0, step = 75 }: { text: string; start?: number; step?: number }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((w, i) => (
        <span key={i} className="word-rise" style={{ animationDelay: `${start + i * step}ms` }}>
          {w}{i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </>
  );
}
