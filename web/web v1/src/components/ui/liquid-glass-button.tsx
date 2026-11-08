"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const liquidbuttonVariants = cva(
  "inline-flex items-center transition-colors justify-center cursor-pointer gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-[color,box-shadow,transform] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-white/[0.04] hover:bg-white/[0.08] hover:scale-[1.02] active:scale-[0.98] duration-200 transition text-white border border-white/15",
        primary:
          "bg-gradient-to-r from-orange-500/20 via-fuchsia-500/20 to-cyan-500/20 hover:bg-white/[0.08] hover:scale-[1.02] active:scale-[0.98] duration-200 transition text-white border border-white/20",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-8 text-xs gap-1.5 px-4",
        lg: "h-12 px-8 text-sm",
        xl: "h-12 rounded-full px-8",
        xxl: "h-13 rounded-full px-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export function GlassFilter() {
  return (
    <svg className="hidden absolute w-0 h-0 pointer-events-none" aria-hidden="true">
      <defs>
        <filter
          id="container-glass"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          {/* Generate turbulent noise for distortion */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.05 0.05"
            numOctaves="1"
            seed="1"
            result="turbulence"
          />

          {/* Blur the turbulence pattern slightly */}
          <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />

          {/* Displace the source graphic with the noise */}
          <feDisplacementMap
            in="SourceGraphic"
            in2="blurredNoise"
            scale="70"
            xChannelSelector="R"
            yChannelSelector="B"
            result="displaced"
          />

          {/* Apply overall blur on the final result */}
          <feGaussianBlur in="displaced" stdDeviation="4" result="finalBlur" />

          {/* Output the result */}
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}

export interface LiquidButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof liquidbuttonVariants> {
  asChild?: boolean;
}

export const LiquidButton = React.forwardRef<HTMLButtonElement, LiquidButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        data-slot="button"
        className={cn(
          "relative overflow-hidden group transition-all duration-300",
          liquidbuttonVariants({ variant, size, className })
        )}
        {...props}
      >
        {/* Optical Glass Multi-layered Inner Shading */}
        <div className="absolute top-0 left-0 z-0 h-full w-full rounded-full 
            shadow-[0_0_8px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3.5px_rgba(255,255,255,0.15),inset_-3px_-3px_0.5px_-3.5px_rgba(255,255,255,0.7),inset_1px_1px_1px_-0.5px_rgba(255,255,255,0.5),inset_-1px_-1px_1px_-0.5px_rgba(255,255,255,0.5),inset_0_0_6px_6px_rgba(255,255,255,0.1),inset_0_0_2px_2px_rgba(255,255,255,0.06),0_0_12px_rgba(0,0,0,0.2)] 
            transition-all group-hover:inset-shadow-white/20" 
        />
        <div
          className="absolute top-0 left-0 isolate -z-10 h-full w-full overflow-hidden rounded-full backdrop-blur-md"
          style={{ backdropFilter: 'url("#container-glass") blur(12px)' }}
        />

        <div className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </div>
        <GlassFilter />
      </Comp>
    );
  }
);

LiquidButton.displayName = "LiquidButton";

export default LiquidButton;
