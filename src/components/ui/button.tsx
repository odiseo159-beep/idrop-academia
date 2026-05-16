"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:brightness-110 hover:shadow-[0_0_30px_-5px_rgba(240,185,11,0.6)] active:scale-[0.98]",
        secondary:
          "bg-surface-elevated text-foreground border border-border hover:border-border-strong hover:bg-surface",
        ghost:
          "text-foreground/80 hover:text-foreground hover:bg-surface-elevated",
        outline:
          "border border-border-strong text-foreground hover:bg-surface-elevated hover:border-foreground/30",
        gradient:
          "relative bg-gradient-to-r from-accent-pink via-accent-purple to-accent-orange text-foreground hover:brightness-110 active:scale-[0.98] shadow-[0_0_40px_-10px_rgba(139,92,246,0.6)]",
        glass:
          "glass text-foreground hover:bg-white/5",
      },
      size: {
        sm: "h-9 px-4 text-sm [&_svg]:size-4",
        md: "h-11 px-6 text-sm [&_svg]:size-4",
        lg: "h-13 px-8 text-base [&_svg]:size-5",
        xl: "h-14 px-10 text-base font-semibold [&_svg]:size-5",
        icon: "h-10 w-10 [&_svg]:size-4",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
