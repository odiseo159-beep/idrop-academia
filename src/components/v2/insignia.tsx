/**
 * Insignia — editorial wax-seal reward visual for the Academia.
 *
 * Replaces the XP-as-prominent-number pattern with a collectible-style
 * milestone. One per module. Two states (locked / earned) and four sizes
 * (sm / md / lg / xl).
 *
 * Visual: rotated square ("rombo") with a counter-rotated serif italic
 * Roman numeral inside (I, II, III, IV, V, VI). Tone picks one of three
 * editorial accents matching the curriculum progression (bnb yellow for
 * the opening modules, plum for the middle, ember for the closer).
 *
 * Server-safe (no client features). Renders identically on SSR and client.
 */
import { MODULE_ORDER } from "@/lib/module-order";

const ROMAN = ["I", "II", "III", "IV", "V", "VI"] as const;

export type InsigniaSize = "sm" | "md" | "lg" | "xl";
export type InsigniaState = "locked" | "earned";

const SIZES: Record<InsigniaSize, { wrap: number; numeral: number }> = {
  sm: { wrap: 26, numeral: 13 },
  md: { wrap: 48, numeral: 22 },
  lg: { wrap: 96, numeral: 42 },
  xl: { wrap: 168, numeral: 72 },
};

type Tone = "bnb" | "plum" | "ember";
const TONES: Record<Tone, { fill: string; ink: string; line: string }> = {
  bnb: {
    fill: "var(--color-bnb)",
    ink: "#15110a",
    line: "var(--color-bnb-line)",
  },
  plum: {
    fill: "#b89ad9",
    ink: "#1c1320",
    line: "rgba(184,154,217,0.42)",
  },
  ember: {
    fill: "var(--color-ember)",
    ink: "#2a0e07",
    line: "rgba(232,130,88,0.42)",
  },
};

function toneForIndex(idx: number, total: number): Tone {
  if (idx <= 1) return "bnb";
  if (idx >= total - 1) return "ember";
  return "plum";
}

interface InsigniaProps {
  moduleSlug: string;
  state: InsigniaState;
  size?: InsigniaSize;
  /** Override the auto-tone if you need a specific accent. */
  toneOverride?: Tone;
  /** Accessible label override. Default: "Insignia I" / "Insignia I (no obtenida)". */
  ariaLabel?: string;
}

export function Insignia({
  moduleSlug,
  state,
  size = "md",
  toneOverride,
  ariaLabel,
}: InsigniaProps) {
  const idx = MODULE_ORDER.indexOf(moduleSlug);
  const safeIdx = idx >= 0 ? idx : 0;
  const total = MODULE_ORDER.length;
  const tone = toneOverride ?? toneForIndex(safeIdx, total);
  const palette = TONES[tone];
  const dim = SIZES[size];
  const numeral = ROMAN[safeIdx] ?? String(safeIdx + 1);
  const earned = state === "earned";

  return (
    <span
      role="img"
      aria-label={ariaLabel ?? `Insignia ${numeral}${earned ? "" : " · no obtenida"}`}
      style={{
        display: "inline-flex",
        width: dim.wrap,
        height: dim.wrap,
        background: earned ? palette.fill : "transparent",
        border: `1px solid ${earned ? palette.fill : "var(--color-line-2)"}`,
        boxShadow: earned ? `0 0 0 1px ${palette.line}` : "none",
        transform: "rotate(45deg)",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <span
        className="v2-serif v2-tnum"
        style={{
          fontStyle: "italic",
          fontSize: dim.numeral,
          color: earned ? palette.ink : "var(--color-t-3)",
          transform: "rotate(-45deg)",
          fontWeight: 500,
          letterSpacing: "-0.02em",
          lineHeight: 1,
          userSelect: "none",
        }}
        aria-hidden
      >
        {numeral}
      </span>
    </span>
  );
}

interface InsigniaGalleryProps {
  /** Module slugs in order. Pass all 6 to render the full collection row. */
  moduleSlugs: string[];
  completedSlugs: string[];
  size?: InsigniaSize;
  gap?: number;
}

/**
 * Row of insignias for use in the profile (full set, 6 wide) or §02 Academia
 * (preview). Locked diamonds render as outline, earned ones filled.
 */
export function InsigniaGallery({
  moduleSlugs,
  completedSlugs,
  size = "md",
  gap = 28,
}: InsigniaGalleryProps) {
  const ordered = [...moduleSlugs].sort((a, b) => {
    const ai = MODULE_ORDER.indexOf(a);
    const bi = MODULE_ORDER.indexOf(b);
    return (ai === -1 ? Infinity : ai) - (bi === -1 ? Infinity : bi);
  });

  return (
    <div
      style={{
        display: "inline-flex",
        gap,
        alignItems: "center",
      }}
    >
      {ordered.map((slug) => (
        <Insignia
          key={slug}
          moduleSlug={slug}
          state={completedSlugs.includes(slug) ? "earned" : "locked"}
          size={size}
        />
      ))}
    </div>
  );
}
