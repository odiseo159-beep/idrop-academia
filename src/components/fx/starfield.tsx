import { cn } from "@/lib/utils";

interface StarfieldProps {
  className?: string;
  density?: "low" | "medium" | "high";
}

export function Starfield({ className, density = "medium" }: StarfieldProps) {
  const layers = density === "high" ? 3 : density === "low" ? 1 : 2;
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {Array.from({ length: layers }).map((_, i) => (
        <div
          key={i}
          className="absolute inset-0 stars-bg opacity-70 animate-pulse-soft"
          style={{
            animationDelay: `${i * 1.2}s`,
            animationDuration: `${3 + i}s`,
            transform: `translateZ(${i * 10}px) scale(${1 + i * 0.15})`,
          }}
        />
      ))}
    </div>
  );
}
