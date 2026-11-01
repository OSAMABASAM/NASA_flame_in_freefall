import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "glow inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 active:translate-y-0 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-input bg-card hover:border-charcoal hover:bg-charcoal hover:text-charcoal-foreground",
        ghost: "text-muted-foreground hover:bg-raised hover:text-foreground",
        chip: "bg-card text-left font-normal text-secondary-foreground hover:bg-sun hover:text-sun-foreground",
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

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
