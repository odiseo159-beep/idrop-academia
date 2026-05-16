import { cn } from "@/lib/utils";

interface WireframeSphereProps {
  className?: string;
  size?: number;
  meridians?: number;
  parallels?: number;
  color?: string;
  spin?: boolean;
}

/**
 * Pure SVG distorted wireframe sphere — evokes the Enchart hero shape
 * without the Three.js cost.
 */
export function WireframeSphere({
  className,
  size = 480,
  meridians = 14,
  parallels = 10,
  color = "rgba(255,255,255,0.35)",
  spin = true,
}: WireframeSphereProps) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.42;

  const meridianPaths = Array.from({ length: meridians }).map((_, i) => {
    const angle = (i / meridians) * Math.PI;
    const rx = Math.abs(Math.cos(angle)) * r;
    const ry = r;
    return (
      <ellipse
        key={`m-${i}`}
        cx={cx}
        cy={cy}
        rx={Math.max(rx, 1)}
        ry={ry}
        fill="none"
        stroke={color}
        strokeWidth={0.6}
        opacity={0.55}
      />
    );
  });

  const parallelPaths = Array.from({ length: parallels }).map((_, i) => {
    const t = (i + 1) / (parallels + 1);
    const y = cy - r + t * 2 * r;
    const ry = r * 0.05;
    const rx = Math.sqrt(Math.max(0, r * r - (y - cy) * (y - cy)));
    return (
      <ellipse
        key={`p-${i}`}
        cx={cx}
        cy={y}
        rx={rx}
        ry={ry}
        fill="none"
        stroke={color}
        strokeWidth={0.6}
        opacity={0.45}
      />
    );
  });

  return (
    <div
      aria-hidden
      className={cn(
        "relative",
        spin && "animate-wireframe",
        className
      )}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        className="overflow-visible"
      >
        <defs>
          <radialGradient id="sphere-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(139,92,246,0.25)" />
            <stop offset="60%" stopColor="rgba(139,92,246,0.08)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
          <radialGradient id="sphere-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={r * 1.4} fill="url(#sphere-glow)" />
        <circle cx={cx} cy={cy} r={r} fill="url(#sphere-core)" />
        <g>{meridianPaths}</g>
        <g>{parallelPaths}</g>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={0.8} opacity={0.7} />
      </svg>
    </div>
  );
}
