"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { motion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";

// shadcn-style button, restyled with the design tokens. Soft lift on hover, soft press on tap (Motion).
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-input bg-card hover:border-muted-foreground/50 hover:bg-raised",
        ghost: "text-muted-foreground hover:bg-raised hover:text-foreground",
        chip: "rounded-full border border-border bg-card/60 text-left font-normal text-secondary-foreground hover:border-primary/50 hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        sm: "h-8 px-3",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
        chip: "min-h-9 px-3.5 py-1.5",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = HTMLMotionProps<"button"> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97, y: 0 }}
      transition={{ duration: 0.15 }}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
