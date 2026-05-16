import { cn } from "@/lib/utils";

interface PlasmaShapeProps {
  className?: string;
  variant?: "torus" | "wave" | "blob" | "ring";
  size?: number;
}

export function PlasmaShape({
  className,
  variant = "torus",
  size = 280,
}: PlasmaShapeProps) {
  const id = `plasma-${variant}`;
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none animate-float", className)}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 200 200" width={size} height={size}>
        <defs>
          <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff3df0" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ff8a3d" />
          </linearGradient>
          <filter id={`${id}-blur`}>
            <feGaussianBlur stdDeviation="0.4" />
          </filter>
        </defs>
        {variant === "torus" && (
          <g filter={`url(#${id}-blur)`}>
            {Array.from({ length: 18 }).map((_, i) => {
              const a = (i / 18) * Math.PI * 2;
              const rx = 70 + Math.sin(a * 2) * 8;
              const ry = 30 + Math.cos(a * 2) * 6;
              return (
                <ellipse
                  key={i}
                  cx="100"
                  cy="100"
                  rx={rx}
                  ry={ry}
                  fill="none"
                  stroke={`url(#${id}-grad)`}
                  strokeWidth="0.8"
                  opacity={0.55}
                  transform={`rotate(${(i * 180) / 18} 100 100)`}
                />
              );
            })}
          </g>
        )}
        {variant === "wave" && (
          <g filter={`url(#${id}-blur)`}>
            {Array.from({ length: 22 }).map((_, i) => {
              const y = 30 + i * 6;
              const offset = Math.sin(i * 0.6) * 14;
              return (
                <path
                  key={i}
                  d={`M 20 ${y} Q 100 ${y + offset} 180 ${y}`}
                  fill="none"
                  stroke={`url(#${id}-grad)`}
                  strokeWidth="0.7"
                  opacity={0.6}
                />
              );
            })}
          </g>
        )}
        {variant === "blob" && (
          <g filter={`url(#${id}-blur)`}>
            {Array.from({ length: 30 }).map((_, i) => {
              const t = i / 30;
              const r = 30 + t * 50;
              return (
                <circle
                  key={i}
                  cx="100"
                  cy="100"
                  r={r}
                  fill="none"
                  stroke={`url(#${id}-grad)`}
                  strokeWidth="0.5"
                  opacity={0.7 - t * 0.5}
                  transform={`scale(${1 + Math.sin(t * Math.PI * 4) * 0.1} ${1 + Math.cos(t * Math.PI * 3) * 0.08})`}
                  style={{ transformOrigin: "100px 100px" }}
                />
              );
            })}
          </g>
        )}
        {variant === "ring" && (
          <g filter={`url(#${id}-blur)`}>
            {Array.from({ length: 12 }).map((_, i) => (
              <circle
                key={i}
                cx="100"
                cy="100"
                r={30 + i * 5}
                fill="none"
                stroke={`url(#${id}-grad)`}
                strokeWidth="0.8"
                opacity={0.6 - i * 0.04}
              />
            ))}
          </g>
        )}
      </svg>
    </div>
  );
}
