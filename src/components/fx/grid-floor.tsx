import { cn } from "@/lib/utils";

export function GridFloor({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 h-[60vh] overflow-hidden",
        className
      )}
    >
      <div className="absolute inset-x-0 bottom-0 h-full grid-floor-perspective" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
