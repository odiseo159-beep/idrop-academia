import { cn } from "@/lib/utils";

interface GradientBlobProps {
  className?: string;
  variant?: "pink-purple" | "purple-orange" | "cyan-purple" | "primary";
  size?: "sm" | "md" | "lg" | "xl";
  blur?: "soft" | "hard" | "none";
}

const sizeMap = {
  sm: "h-48 w-48",
  md: "h-72 w-72",
  lg: "h-96 w-96",
  xl: "h-[32rem] w-[32rem]",
};

const blurMap = {
  none: "",
  soft: "blur-3xl",
  hard: "blur-2xl",
};

const variantMap = {
  "pink-purple":
    "bg-[conic-gradient(from_0deg_at_50%_50%,#ff3df0,#8b5cf6,#ff3df0)]",
  "purple-orange":
    "bg-[conic-gradient(from_45deg_at_50%_50%,#8b5cf6,#ff8a3d,#ff3df0,#8b5cf6)]",
  "cyan-purple":
    "bg-[conic-gradient(from_90deg_at_50%_50%,#38bdf8,#8b5cf6,#ff3df0,#38bdf8)]",
  primary:
    "bg-[conic-gradient(from_0deg_at_50%_50%,#f0b90b,#ff8a3d,#fbd038,#f0b90b)]",
};

export function GradientBlob({
  className,
  variant = "pink-purple",
  size = "lg",
  blur = "soft",
}: GradientBlobProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute rounded-full opacity-60 mix-blend-screen animate-blob",
        sizeMap[size],
        blurMap[blur],
        variantMap[variant],
        className
      )}
    />
  );
}
