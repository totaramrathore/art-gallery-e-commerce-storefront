export function Stars({
  rating,
  size = "sm",
  className = "",
}: {
  rating: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(5, rating));
  const percent = (clamped / 5) * 100;

  return (
    <span
      className={`inline-flex select-none items-center ${className}`}
      role="img"
      aria-label={`${clamped.toFixed(1)} out of 5 stars`}
      style={{
        backgroundImage: `linear-gradient(90deg, var(--color-ochre) ${percent}%, color-mix(in oklab, var(--color-ink) 25%, transparent) ${percent}%)`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        fontSize: size === "sm" ? "0.8rem" : "1.05rem",
        letterSpacing: "0.12em",
        lineHeight: 1,
      }}
    >
      ★★★★★
    </span>
  );
}
