"use client";

import { motion } from "framer-motion";

export type TitleStyleId = "gradient-shimmer" | "floating-wave" | "beveled-neon" | "cosmic-sparkle";

interface Props {
  styleId: TitleStyleId;
}

export function SignInTitle({ styleId }: Props) {
  // Option 1: Liquid Shimmer Gradient
  if (styleId === "gradient-shimmer") {
    return (
      <div className="relative inline-flex items-center justify-center select-none py-1">
        <motion.h1
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="text-4xl sm:text-[48px] font-black tracking-tight text-center font-sans bg-clip-text text-transparent bg-gradient-to-r from-[#ff7236] via-[#ec4899] via-[#a855f7] to-[#22d3ee] bg-[length:200%_auto] drop-shadow-[0_4px_24px_rgba(236,72,153,0.5)]"
        >
          Sign In
        </motion.h1>
      </div>
    );
  }

  // Option 2: Floating Wave with Staggered Bounces & Hover Physics
  if (styleId === "floating-wave") {
    const letters = [
      { char: "S", color: "#ff7236", glow: "rgba(255,114,54,0.7)" },
      { char: "i", color: "#f43f5e", glow: "rgba(244,63,94,0.7)" },
      { char: "g", color: "#c084fc", glow: "rgba(192,132,252,0.7)" },
      { char: "n", color: "#22d3ee", glow: "rgba(34,211,238,0.7)" },
      { char: " ", color: "transparent", glow: "none" },
      { char: "I", color: "#ec4899", glow: "rgba(236,72,153,0.7)" },
      { char: "n", color: "#38bdf8", glow: "rgba(56,189,248,0.7)" },
    ];

    return (
      <div className="flex items-center justify-center gap-[2px] select-none py-1">
        {letters.map((l, i) =>
          l.char === " " ? (
            <span key={i} className="w-3.5" />
          ) : (
            <motion.span
              key={i}
              animate={{
                y: [-3, 3, -3],
              }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.14,
              }}
              whileHover={{
                scale: 1.25,
                y: -6,
                rotate: i % 2 === 0 ? -6 : 6,
                transition: { type: "spring", stiffness: 400, damping: 10 },
              }}
              className="text-4xl sm:text-[46px] font-black cursor-pointer inline-block"
              style={{
                color: l.color,
                filter: `drop-shadow(0 0 16px ${l.glow})`,
              }}
            >
              {l.char}
            </motion.span>
          )
        )}
      </div>
    );
  }

  // Option 3: 3D Beveled Neon (Exact Aesthetic of the NT 3D Logo)
  if (styleId === "beveled-neon") {
    return (
      <div className="relative select-none py-1">
        <h1
          className="text-4xl sm:text-[48px] font-black tracking-wider text-center font-sans uppercase relative"
          style={{
            color: "#0a101f",
            WebkitTextStroke: "1.5px #f43f5e",
            textShadow: `
              0 0 1px #ff7236,
              0 0 15px rgba(236, 72, 153, 0.7),
              0 0 30px rgba(34, 211, 238, 0.5),
              2px 2px 0px rgba(0, 0, 0, 0.9)
            `,
          }}
        >
          <span className="bg-gradient-to-b from-white/90 via-white/40 to-white/10 bg-clip-text text-transparent">
            Sign In
          </span>
        </h1>
      </div>
    );
  }

  // Option 4: Cosmic Glow & Orbital Sparkles
  return (
    <div className="relative inline-flex items-center justify-center select-none py-1">
      {/* Little floating star top-left */}
      <motion.div
        animate={{
          scale: [0.7, 1.2, 0.7],
          opacity: [0.4, 1, 0.4],
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute -left-6 -top-2 w-3.5 h-3.5 text-amber-300 pointer-events-none drop-shadow-[0_0_8px_#fde047]"
      >
        ✦
      </motion.div>

      {/* Main Letters with Vibrant Dual-Neon */}
      <h1 className="text-4xl sm:text-[48px] font-black tracking-tight text-center font-sans flex items-center gap-1">
        <span className="bg-gradient-to-r from-[#ff7236] to-[#ec4899] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(244,63,94,0.6)]">
          Sign
        </span>
        <span className="bg-gradient-to-r from-[#a855f7] to-[#22d3ee] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(34,211,238,0.6)]">
          In
        </span>
      </h1>

      {/* Little floating star bottom-right */}
      <motion.div
        animate={{
          scale: [1.2, 0.7, 1.2],
          opacity: [1, 0.4, 1],
        }}
        transition={{ duration: 2.2, repeat: Infinity }}
        className="absolute -right-6 -bottom-1 w-3.5 h-3.5 text-[#ff4bb8] pointer-events-none drop-shadow-[0_0_8px_#ff4bb8]"
      >
        ✦
      </motion.div>
    </div>
  );
}
