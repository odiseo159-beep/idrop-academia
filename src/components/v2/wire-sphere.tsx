import { cn } from "@/lib/utils";

interface WireSphereProps {
  size?: number;
  stroke?: string;
  strokeWidth?: number;
  accentStroke?: string | null;
  latCount?: number;
  lonCount?: number;
  className?: string;
  spin?: boolean;
}

/**
 * Pure-SVG wireframe sphere — circle + latitude ellipses + longitude curves.
 * Ported from Claude Design handoff.
 */
export function WireSphere({
  size = 200,
  stroke = "rgba(255,255,255,0.32)",
  strokeWidth = 0.6,
  accentStroke = null,
  latCount = 7,
  lonCount = 8,
  className,
  spin = false,
}: WireSphereProps) {
  const r = 100;
  const cx = 0;
  const cy = 0;

  const lats = [];
  for (let i = 1; i < latCount; i++) {
    const t = i / latCount;
    const y = -r + 2 * r * t;
    const ry = Math.max(2, Math.sqrt(Math.max(0, r * r - y * y)) * 0.18);
    const rx = Math.sqrt(Math.max(0, r * r - y * y));
    lats.push({ y, rx, ry });
  }

  const lons = [];
  for (let j = 0; j < lonCount; j++) {
    const angle = (j / lonCount) * 180;
    const rx = Math.abs(r * Math.cos((angle * Math.PI) / 180));
    lons.push({ angle, rx });
  }

  return (
    <svg
      viewBox="-110 -110 220 220"
      width={size}
      height={size}
      className={cn(spin && "v2-sphere-spin", className)}
      aria-hidden
    >
      <g fill="none" stroke={stroke} strokeWidth={strokeWidth}>
        <circle cx={cx} cy={cy} r={r} />
        {lats.map((l, i) => (
          <ellipse key={`la-${i}`} cx={cx} cy={l.y} rx={l.rx} ry={l.ry} />
        ))}
        {lons.map((l, j) => (
          <ellipse key={`lo-${j}`} cx={cx} cy={cy} rx={l.rx} ry={r} />
        ))}
      </g>
      {accentStroke && lats[Math.floor(latCount / 2) - 1] && (
        <g fill="none" stroke={accentStroke} strokeWidth={strokeWidth * 1.4}>
          <ellipse
            cx={cx}
            cy={cy}
            rx={r}
            ry={lats[Math.floor(latCount / 2) - 1].ry}
          />
        </g>
      )}
    </svg>
  );
}
