"use client";

import React, { useState, useEffect, useRef, useId, useMemo, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, Check, AlertCircle, X, Send, KeyRound, CheckCircle2, HelpCircle } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { LiquidButton } from "./liquid-glass-button";
import { SignInTitle, type TitleStyleId } from "./SignInTitleStyles";
import { insforge } from "@/lib/insforge";

// Clean self-contained cn utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Dark mode helper
export const useDarkMode = (): boolean => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkDark = () => {
      const isHtmlDark = document.documentElement.classList.contains("dark");
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      return isHtmlDark || mediaQuery.matches;
    };

    setIsDark(checkDark());

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setIsDark(checkDark());
    mediaQuery.addEventListener("change", handler);

    const observer = new MutationObserver(() => setIsDark(checkDark()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      mediaQuery.removeEventListener("change", handler);
      observer.disconnect();
    };
  }, []);

  return isDark;
};

// Liquid Glass Presets
export const GLASS_PRESETS = {
  subtle: {
    backgroundOpacity: 0.06,
    saturation: 1.1,
    brightness: 55,
    blur: 8,
    displace: 0.3,
    distortionScale: -20,
    redOffset: -1,
    greenOffset: 1,
    blueOffset: 3,
    mixBlendMode: "difference",
  },
  default: {
    backgroundOpacity: 0.1,
    saturation: 1.4,
    brightness: 55,
    blur: 10,
    displace: 0.4,
    distortionScale: -35,
    redOffset: 0,
    greenOffset: 2,
    blueOffset: 4,
    mixBlendMode: "difference",
  },
  bold: {
    backgroundOpacity: 0.18,
    saturation: 1.8,
    brightness: 60,
    blur: 12,
    displace: 0.6,
    distortionScale: -55,
    redOffset: 1,
    greenOffset: 3,
    blueOffset: 6,
    mixBlendMode: "screen",
  },
  ghost: {
    backgroundOpacity: 0,
    saturation: 1,
    brightness: 55,
    blur: 6,
    displace: 0,
    distortionScale: 0,
    redOffset: 0,
    greenOffset: 0,
    blueOffset: 0,
    mixBlendMode: "difference",
  },
};

export type GlassVariant = keyof typeof GLASS_PRESETS;

export const GLASS_DEFAULTS = {
  width: "auto",
  height: "auto",
  borderRadius: 16,
  borderWidth: 0.03,
  opacity: 0.93,
  xChannel: "R",
  yChannel: "G",
};

export interface GlassProps {
  variant?: GlassVariant;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  borderWidth?: number;
  brightness?: number;
  opacity?: number;
  blur?: number;
  displace?: number;
  backgroundOpacity?: number;
  saturation?: number;
  distortionScale?: number;
  redOffset?: number;
  greenOffset?: number;
  blueOffset?: number;
  xChannel?: "R" | "G" | "B" | "A";
  yChannel?: "R" | "G" | "B" | "A";
  mixBlendMode?: string;
  dark?: boolean;
}

export const Glass: React.FC<GlassProps> = (rawProps) => {
  const {
    variant = "default",
    children,
    className = "",
    style = {},
    width,
    height,
    borderRadius,
    borderWidth,
    brightness,
    opacity,
    blur,
    displace,
    backgroundOpacity,
    saturation,
    distortionScale,
    redOffset,
    greenOffset,
    blueOffset,
    xChannel,
    yChannel,
    mixBlendMode,
    dark,
  } = rawProps;

  const uniqueId = useId().replace(/:/g, "-");
  const filterId = `glass-filter-${uniqueId}`;
  const redGradId = `red-grad-${uniqueId}`;
  const blueGradId = `blue-grad-${uniqueId}`;

  const containerRef = useRef<HTMLDivElement>(null);
  const feImageRef = useRef<SVGFEImageElement>(null);
  const redChannelRef = useRef<SVGFEDisplacementMapElement>(null);
  const greenChannelRef = useRef<SVGFEDisplacementMapElement>(null);
  const blueChannelRef = useRef<SVGFEDisplacementMapElement>(null);
  const gaussianBlurRef = useRef<SVGFEGaussianBlurElement>(null);

  const systemDarkMode = useDarkMode();
  const isDarkMode = dark !== undefined ? dark : systemDarkMode;

  const v = useMemo(() => {
    const p = GLASS_PRESETS[variant] ?? GLASS_PRESETS.default;
    return {
      ...GLASS_DEFAULTS,
      ...p,
      ...(width !== undefined && { width }),
      ...(height !== undefined && { height }),
      ...(borderRadius !== undefined && { borderRadius }),
      ...(borderWidth !== undefined && { borderWidth }),
      ...(brightness !== undefined && { brightness }),
      ...(opacity !== undefined && { opacity }),
      ...(blur !== undefined && { blur }),
      ...(displace !== undefined && { displace }),
      ...(backgroundOpacity !== undefined && { backgroundOpacity }),
      ...(saturation !== undefined && { saturation }),
      ...(distortionScale !== undefined && { distortionScale }),
      ...(redOffset !== undefined && { redOffset }),
      ...(greenOffset !== undefined && { greenOffset }),
      ...(blueOffset !== undefined && { blueOffset }),
      ...(xChannel !== undefined && { xChannel }),
      ...(yChannel !== undefined && { yChannel }),
      ...(mixBlendMode !== undefined && { mixBlendMode }),
    };
  }, [
    variant,
    width,
    height,
    borderRadius,
    borderWidth,
    brightness,
    opacity,
    blur,
    displace,
    backgroundOpacity,
    saturation,
    distortionScale,
    redOffset,
    greenOffset,
    blueOffset,
    xChannel,
    yChannel,
    mixBlendMode,
  ]);

  const generateDisplacementMap = () => {
    const rect = containerRef.current?.getBoundingClientRect();
    const actualWidth = rect?.width || 400;
    const actualHeight = rect?.height || 200;
    const edgeSize = Math.min(actualWidth, actualHeight) * (v.borderWidth * 0.5);

    const svgContent = `
      <svg viewBox="0 0 ${actualWidth} ${actualHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="${redGradId}" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="red"/>
          </linearGradient>
          <linearGradient id="${blueGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="blue"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" fill="black"></rect>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${v.borderRadius}" fill="url(#${redGradId})" />
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${v.borderRadius}" fill="url(#${blueGradId})" style="mix-blend-mode: ${v.mixBlendMode}" />
        <rect x="${edgeSize}" y="${edgeSize}" width="${
      actualWidth - edgeSize * 2
    }" height="${
      actualHeight - edgeSize * 2
    }" rx="${v.borderRadius}" fill="hsl(0 0% ${v.brightness}% / ${
      v.opacity
    })" style="filter:blur(${v.blur}px)" />
      </svg>
    `;

    return `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
  };

  const updateDisplacementMap = () => {
    if (feImageRef.current) {
      feImageRef.current.setAttribute("href", generateDisplacementMap());
    }
  };

  useEffect(() => {
    updateDisplacementMap();
    [
      { ref: redChannelRef, offset: v.redOffset },
      { ref: greenChannelRef, offset: v.greenOffset },
      { ref: blueChannelRef, offset: v.blueOffset },
    ].forEach(({ ref, offset }) => {
      if (ref.current) {
        ref.current.setAttribute(
          "scale",
          (v.distortionScale + offset).toString()
        );
        ref.current.setAttribute("xChannelSelector", v.xChannel);
        ref.current.setAttribute("yChannelSelector", v.yChannel);
      }
    });

    if (gaussianBlurRef.current) {
      gaussianBlurRef.current.setAttribute(
        "stdDeviation",
        v.displace.toString()
      );
    }
  }, [
    v.width,
    v.height,
    v.borderRadius,
    v.borderWidth,
    v.brightness,
    v.opacity,
    v.blur,
    v.displace,
    v.distortionScale,
    v.redOffset,
    v.greenOffset,
    v.blueOffset,
    v.xChannel,
    v.yChannel,
    v.mixBlendMode,
    variant,
  ]);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      setTimeout(updateDisplacementMap, 0);
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    setTimeout(updateDisplacementMap, 0);
  }, [v.width, v.height]);

  const [svgFilterSupported, setSvgFilterSupported] = useState(true);

  useEffect(() => {
    const checkSupport = () => {
      const isWebkit =
        typeof navigator !== "undefined" &&
        /Safari/.test(navigator.userAgent) &&
        !/Chrome/.test(navigator.userAgent);
      const isFirefox = typeof navigator !== "undefined" && /Firefox/.test(navigator.userAgent);
      setSvgFilterSupported(!isWebkit && !isFirefox);
    };
    checkSupport();
  }, [filterId]);

  const getContainerStyles = (): React.CSSProperties => {
    const baseStyles = {
      ...style,
      ...(v.width && v.width !== "auto" && { width: typeof v.width === "number" ? `${v.width}px` : v.width }),
      ...(v.height && v.height !== "auto" && { height: typeof v.height === "number" ? `${v.height}px` : v.height }),
      borderRadius: `${v.borderRadius}px`,
      "--glass-frost": v.backgroundOpacity,
      "--glass-saturation": v.saturation,
    };

    if (svgFilterSupported) {
      return {
        ...baseStyles,
        background: isDarkMode
          ? `hsl(0 0% 0% / ${v.backgroundOpacity})`
          : `hsl(0 0% 100% / ${v.backgroundOpacity})`,
        backdropFilter: `url(#${filterId}) saturate(${v.saturation})`,
        border: isDarkMode
          ? "1px solid rgba(255, 255, 255, 0.08)"
          : "1px solid rgba(0, 0, 0, 0.06)",
        boxShadow: isDarkMode
          ? `0 0 1px 0 rgba(255, 255, 255, 0.1) inset,
             0px 4px 16px rgba(17, 17, 26, 0.05)`
          : `0 0 1px 0 rgba(0, 0, 0, 0.05) inset,
             0px 4px 16px rgba(17, 17, 26, 0.05)`,
      } as React.CSSProperties;
    } else {
      return {
        ...baseStyles,
        background: isDarkMode
          ? "rgba(0, 0, 0, 0.3)"
          : "rgba(255, 255, 255, 0.2)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.06)",
      } as React.CSSProperties;
    }
  };

  const glassClasses =
    "relative flex items-center justify-center overflow-hidden transition-all duration-[260ms] ease-out";

  return (
    <div
      ref={containerRef}
      className={cn(glassClasses, className)}
      style={getContainerStyles()}
    >
      <svg
        className="w-full h-full pointer-events-none absolute inset-0 opacity-0 -z-10"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter
            id={filterId}
            colorInterpolationFilters="sRGB"
            x="0%"
            y="0%"
            width="100%"
            height="100%"
          >
            <feImage
              ref={feImageRef}
              href={
                generateDisplacementMap() ||
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'%3E%3C/svg%3E"
              }
              x="0"
              y="0"
              width="100%"
              height="100%"
              preserveAspectRatio="none"
              result="map"
            />
            <feDisplacementMap
              ref={redChannelRef}
              in="SourceGraphic"
              in2="map"
              id="redchannel"
              result="dispRed"
            />
            <feColorMatrix
              in="dispRed"
              type="matrix"
              values="1 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
              result="red"
            />
            <feDisplacementMap
              ref={greenChannelRef}
              in="SourceGraphic"
              in2="map"
              id="greenchannel"
              result="dispGreen"
            />
            <feColorMatrix
              in="dispGreen"
              type="matrix"
              values="0 0 0 0 0
                      0 1 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
              result="green"
            />
            <feDisplacementMap
              ref={blueChannelRef}
              in="SourceGraphic"
              in2="map"
              id="bluechannel"
              result="dispBlue"
            />
            <feColorMatrix
              in="dispBlue"
              type="matrix"
              values="0 0 0 0 0
                      0 0 0 0 0
                      0 0 1 0 0
                      0 0 0 1 0"
              result="blue"
            />
            <feBlend in="red" in2="green" mode="screen" result="rg" />
            <feBlend in="rg" in2="blue" mode="screen" result="output" />
            <feGaussianBlur
              ref={gaussianBlurRef}
              in="output"
              stdDeviation="0.7"
            />
          </filter>
        </defs>
      </svg>

      <div className="w-full h-full flex items-center justify-center p-0 rounded-[inherit] relative z-10">
        {children}
      </div>
    </div>
  );
};

export interface GlassInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  variant?: GlassVariant;
  containerClassName?: string;
  rightElement?: React.ReactNode;
  borderRadius?: number;
  height?: number | string;
  glassProps?: Partial<GlassProps>;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  (
    {
      variant = "default",
      className = "",
      containerClassName = "",
      rightElement,
      borderRadius = 14,
      height = 52,
      glassProps,
      ...inputProps
    },
    ref
  ) => {
    const heightPx = typeof height === "number" ? `${height}px` : height;

    return (
      <Glass
        variant={variant}
        borderRadius={borderRadius}
        dark={true}
        height={height}
        className={cn(
          "w-full transition-all duration-200",
          containerClassName
        )}
        style={{ height: heightPx, minHeight: heightPx }}
        {...glassProps}
      >
        <div
          className="relative w-full flex items-center px-4"
          style={{ height: heightPx, minHeight: heightPx }}
        >
          <input
            ref={ref}
            className={cn(
              "w-full h-full bg-transparent text-white placeholder:text-slate-400/80 border-none outline-none text-[15px] sm:text-[16px] font-semibold leading-none tracking-wide",
              rightElement ? "pr-10" : "pr-0",
              className
            )}
            {...inputProps}
          />
          {rightElement && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center">
              {rightElement}
            </div>
          )}
        </div>
      </Glass>
    );
  }
);

GlassInput.displayName = "GlassInput";

// Sparkle Star SVG Component for the glowing stars
function SparkleStar({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("w-4 h-4 pointer-events-none select-none", className)}
      style={style}
    >
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
  );
}

// Dynamic Starfield with Canvas for high-performance and interactive cosmic feel
export function CosmicStarfield() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    };

    window.addEventListener("resize", handleResize);

    interface Star {
      x: number;
      y: number;
      size: number;
      opacity: number;
      baseOpacity: number;
      twinkleSpeed: number;
      color: string;
      isSparkle?: boolean;
    }

    let stars: Star[] = [];

    const starColors = ["#ffffff", "#e0f2fe", "#fdf4ff", "#fbcfe8", "#bae6fd"];

    const initStars = () => {
      stars = [];
      const count = Math.floor((width * height) / 3200);

      for (let i = 0; i < count; i++) {
        const isSparkle = Math.random() < 0.08;
        const color = starColors[Math.floor(Math.random() * starColors.length)];
        const baseOpacity = isSparkle ? 0.6 + Math.random() * 0.4 : 0.2 + Math.random() * 0.7;

        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: isSparkle ? Math.random() * 1.8 + 1.2 : Math.random() * 1.3 + 0.5,
          opacity: baseOpacity,
          baseOpacity,
          twinkleSpeed: 0.008 + Math.random() * 0.02,
          color,
          isSparkle,
        });
      }
    };

    initStars();

    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX - width / 2) * 0.03;
      targetMouseY = (e.clientY - height / 2) * 0.03;
    };

    window.addEventListener("mousemove", handleMouseMove);

    interface ShootingStar {
      x: number;
      y: number;
      length: number;
      speed: number;
      angle: number;
      opacity: number;
      life: number;
    }

    let shootingStars: ShootingStar[] = [];

    const maybeAddShootingStar = () => {
      if (Math.random() < 0.012 && shootingStars.length < 2) {
        shootingStars.push({
          x: Math.random() * width,
          y: Math.random() * (height * 0.5),
          length: Math.random() * 80 + 40,
          speed: Math.random() * 9 + 7,
          angle: (Math.PI / 4) + (Math.random() * 0.2 - 0.1),
          opacity: 1,
          life: 1,
        });
      }
    };

    let tick = 0;

    const render = () => {
      tick++;
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.opacity = star.baseOpacity + Math.sin(tick * star.twinkleSpeed + i) * 0.35;
        const boundedOpacity = Math.max(0.1, Math.min(1, star.opacity));

        const posX = star.x + currentMouseX * (star.size * 0.8);
        const posY = star.y + currentMouseY * (star.size * 0.8);

        ctx.fillStyle = star.color;
        ctx.globalAlpha = boundedOpacity;

        if (star.isSparkle) {
          const s = star.size * 2.2;
          ctx.beginPath();
          ctx.moveTo(posX, posY - s);
          ctx.lineTo(posX + s * 0.25, posY - s * 0.25);
          ctx.lineTo(posX + s, posY);
          ctx.lineTo(posX + s * 0.25, posY + s * 0.25);
          ctx.lineTo(posX, posY + s);
          ctx.lineTo(posX - s * 0.25, posY + s * 0.25);
          ctx.lineTo(posX - s, posY);
          ctx.lineTo(posX - s * 0.25, posY - s * 0.25);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.arc(posX, posY, star.size * 0.8, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(posX, posY, star.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      maybeAddShootingStar();

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;
        ss.life -= 0.015;

        if (ss.life <= 0 || ss.x > width + 100 || ss.y > height + 100) {
          shootingStars.splice(i, 1);
          continue;
        }

        ctx.strokeStyle = `rgba(255, 255, 255, ${ss.life * 0.8})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(
          ss.x - Math.cos(ss.angle) * ss.length,
          ss.y - Math.sin(ss.angle) * ss.length
        );
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
    />
  );
}

export const DEFAULT_ASTRONAUT_IMAGE = "/astronaut.svg";

export interface SpaceLoginProps {
  title?: string;
  subtitle?: string;
  brandBadge?: string;
  brandLogo?: React.ReactNode;
  astronautSrc?: string;
  showAstronaut?: boolean;
  accentStarColor?: string;
  buttonLabel?: string;
  onSubmit?: (data: { email: string; password: string; rememberMe: boolean }) => Promise<void> | void;
  onForgotPassword?: () => void;
  className?: string;
  defaultEmail?: string;
  glassVariant?: GlassVariant;
  titleStyle?: TitleStyleId;
  errorMessage?: string | null;
}

export function SpaceLogin({
  title = "Sign In",
  subtitle,
  brandBadge,
  brandLogo,
  astronautSrc = DEFAULT_ASTRONAUT_IMAGE,
  showAstronaut = true,
  accentStarColor = "#ff4bb8",
  buttonLabel = "Sign In",
  onSubmit,
  onForgotPassword,
  className,
  defaultEmail = "",
  glassVariant = "default",
  titleStyle = "floating-wave",
  errorMessage,
}: SpaceLoginProps) {
  // Functional Remember Me state stored in localStorage (default false para máxima seguridad)
  const [rememberMe, setRememberMe] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("nextool_remember_me");
      return saved === "true";
    }
    return false;
  });

  const [email, setEmail] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("nextool_saved_email");
      if (savedEmail) return savedEmail;
    }
    return defaultEmail;
  });

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState(defaultEmail || "");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  const handleOpenForgot = () => {
    setForgotEmail(email || defaultEmail);
    setForgotSuccess(false);
    setForgotError(null);
    setShowForgotModal(true);
    if (onForgotPassword) onForgotPassword();
  };

  const handleSendRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    setForgotError(null);
    try {
      const authClient = insforge.auth as any;
      const { error } = authClient.sendResetPasswordEmail
        ? await authClient.sendResetPasswordEmail({
            email: forgotEmail.trim().toLowerCase(),
            redirectTo: window.location.origin + '/login?action=reset',
          })
        : await authClient.resetPasswordForEmail(
            forgotEmail.trim().toLowerCase(),
            {
              redirectTo: window.location.origin + '/login?action=reset',
            }
          );
      if (error) {
        setForgotError(error.message || 'No se pudo enviar el correo de recuperación.');
      } else {
        setForgotSuccess(true);
      }
    } catch (err: any) {
      setForgotError(err?.message || 'Error al conectar con el servidor.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Synchronize defaultEmail if changed by tenant selection and no custom saved email
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("nextool_saved_email");
      if (savedEmail) {
        setEmail(savedEmail);
        return;
      }
    }
    setEmail(defaultEmail);
  }, [defaultEmail]);

  // Handle toggling rememberMe checkbox and sync with localStorage
  const handleRememberToggle = () => {
    const nextVal = !rememberMe;
    setRememberMe(nextVal);
    if (typeof window !== "undefined") {
      localStorage.setItem("nextool_remember_me", nextVal ? "true" : "false");
      if (!nextVal) {
        localStorage.removeItem("nextool_saved_email");
      } else if (email) {
        localStorage.setItem("nextool_saved_email", email);
      }
    }
  };

  // Astronaut mouse-follow parallax
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleGlobalMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 20;
    const y = (clientY / innerHeight - 0.5) * 20;
    setMousePos({ x, y });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || isLoading) return;

    // Persist or clear remember me email on submit
    if (typeof window !== "undefined") {
      if (rememberMe) {
        localStorage.setItem("nextool_saved_email", email);
        localStorage.setItem("nextool_remember_me", "true");
      } else {
        localStorage.removeItem("nextool_saved_email");
        localStorage.setItem("nextool_remember_me", "false");
      }
    }

    setIsLoading(true);
    try {
      if (onSubmit) {
        await onSubmit({ email, password, rememberMe });
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1100));
      }
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2500);
    } catch (err) {
      console.error("Sign in error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      onMouseMove={handleGlobalMouseMove}
      className={cn(
        "relative min-h-screen min-h-[100dvh] w-full bg-[#03060f] text-white flex flex-col items-center justify-between overflow-x-hidden pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))] px-4 select-none",
        className
      )}
    >
      {/* Dynamic Starfield Canvas */}
      <CosmicStarfield />

      {/* Atmospheric Horizon / Planet Glow at the bottom */}
      <div className="absolute -bottom-48 sm:-bottom-56 md:-bottom-64 left-1/2 -translate-x-1/2 w-[160vw] max-w-[1900px] h-[480px] sm:h-[550px] md:h-[620px] pointer-events-none z-0">
        <div
          className="w-full h-full rounded-[100%]"
          style={{
            background:
              "radial-gradient(ellipse at 50% 100%, rgba(224, 102, 70, 0.95) 0%, rgba(199, 81, 58, 0.75) 20%, rgba(67, 142, 145, 0.5) 42%, rgba(20, 48, 70, 0.25) 60%, transparent 80%)",
            filter: "blur(32px)",
          }}
        />
        <div
          className="absolute inset-0 rounded-[100%] opacity-40 mix-blend-screen"
          style={{
            background:
              "radial-gradient(ellipse at 50% 100%, rgba(255, 170, 110, 0.6) 0%, rgba(94, 219, 210, 0.4) 30%, transparent 65%)",
            filter: "blur(48px)",
          }}
        />
      </div>

      {/* 1. Capa Superior: Sign - In centrado arriba con buen tamaño */}
      <header className="relative z-10 w-full flex items-center justify-center pt-3 sm:pt-6 select-none">
        <SignInTitle styleId={titleStyle} />
      </header>

      {/* 2. Capa Central: Datos (Email, Contraseña, Recordarme y Acceder) Centrado en la Mitad */}
      <div className="relative z-10 w-full max-w-5xl flex-1 flex items-center justify-center py-3 my-auto">
        {showAstronaut && (
          <motion.div
            animate={{
              x: mousePos.x * 1.5,
              y: mousePos.y * 1.5,
            }}
            transition={{ type: "spring", damping: 30, stiffness: 60 }}
            className="hidden lg:block absolute left-4 xl:left-12 top-1/2 -translate-y-[62%] pointer-events-none z-20"
          >
            <motion.div
              animate={{
                y: [-12, 14, -12],
                rotate: [-2, 3, -2],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative"
            >
              <img
                src={astronautSrc}
                alt="Floating Mascot"
                className="w-44 lg:w-52 h-auto drop-shadow-[0_15px_30px_rgba(0,0,0,0.85)] filter contrast-125 select-none"
                draggable={false}
              />

              <motion.div
                animate={{
                  scale: [0.85, 1.25, 0.85],
                  opacity: [0.65, 1, 0.65],
                }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -right-3 top-1/2 -translate-y-1/2"
              >
                <SparkleStar
                  className="w-6 h-6"
                  style={{
                    color: accentStarColor,
                    filter: `drop-shadow(0 0 12px ${accentStarColor})`,
                  }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* Central Sign In Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10 w-full max-w-[420px] mx-auto flex flex-col items-center"
        >
          {/* Form with spacious inputs */}
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 sm:gap-4.5">
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-semibold flex items-center gap-2.5 backdrop-blur-md shadow-lg shadow-rose-950/40"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {/* Email Field with Liquid Glass (Spacious Size) */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="space-email"
                className="text-xs sm:text-[13px] font-bold tracking-wider text-slate-100 uppercase select-none flex items-center gap-2 drop-shadow-[0_1px_4px_rgba(255,255,255,0.25)]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff7236] shadow-[0_0_8px_#ff7236]" />
                <span>Email</span>
              </label>
              <GlassInput
                id="space-email"
                type="email"
                required
                autoComplete="email"
                placeholder="nombre@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                variant={glassVariant}
                borderRadius={14}
                height={52}
              />
            </div>

            {/* Password Field with Liquid Glass (Spacious Size) */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="space-password"
                className="text-xs sm:text-[13px] font-bold tracking-wider text-slate-100 uppercase select-none flex items-center gap-2 drop-shadow-[0_1px_4px_rgba(255,255,255,0.25)]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] shadow-[0_0_8px_#22d3ee]" />
                <span>Contraseña</span>
              </label>
              <GlassInput
                id="space-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant={glassVariant}
                borderRadius={14}
                height={52}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                    className="p-1 text-slate-300 hover:text-white focus:outline-none transition-all hover:scale-110 active:scale-95"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                }
              />
            </div>

            {/* Remember Me (Functional with localStorage) & Forgot Password Row */}
            <div className="flex items-center justify-between text-xs sm:text-[13px] pt-1">
              <div
                onClick={handleRememberToggle}
                className="flex items-center gap-2 cursor-pointer group select-none"
              >
                <div
                  className={cn(
                    "w-4.5 h-4.5 rounded-[5px] border transition-all duration-200 flex items-center justify-center shadow-xs",
                    rememberMe
                      ? "bg-gradient-to-tr from-[#ff7236] to-[#ec4899] border-transparent text-white shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                      : "border-slate-500/70 bg-white/5 group-hover:border-sky-400/80 group-hover:bg-white/10"
                  )}
                >
                  {rememberMe && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span className="text-slate-200 group-hover:text-white font-medium tracking-wide transition-colors">
                  Recordarme
                </span>
              </div>

              <button
                type="button"
                onClick={handleOpenForgot}
                className="text-sky-400 hover:text-sky-300 font-bold transition-all hover:underline underline-offset-4 select-none cursor-pointer tracking-wide drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Submit: 21st.dev Liquid Glass Button (Full Width Pill - Gordito y Táctil) */}
            <div className="w-full pt-1.5">
              <LiquidButton
                type="submit"
                disabled={isLoading || isSuccess}
                className="w-full !h-[54px] !min-h-[54px] sm:!h-[58px] sm:!min-h-[58px] rounded-full font-bold text-[15px] sm:text-base tracking-wide shadow-xl cursor-pointer"
              >
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 text-neutral-200 font-semibold"
                    >
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Iniciando sesión...</span>
                    </motion.div>
                  ) : isSuccess ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 text-emerald-300 font-bold"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>¡Acceso autorizado!</span>
                    </motion.div>
                  ) : (
                    <motion.span
                      key="text"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-white font-bold"
                    >
                      {buttonLabel}
                    </motion.span>
                  )}
                </AnimatePresence>
              </LiquidButton>
            </div>
          </form>
        </motion.div>
      </div>

      {/* NexTool Footer Branding: Centrado abajo, sin hueco excesivo, calibrado exacto a la captura 2 */}
      <footer className="relative z-10 w-full flex flex-col items-center justify-center pt-2 pb-1.5 sm:pb-3 select-none group">
        <div className="relative flex flex-col items-center justify-center gap-2 sm:gap-2.5">
          {/* Halo ambiental vivo detrás del logo para potenciar sus colores y eliminar la palidez */}
          <div
            className="absolute -inset-3 rounded-full opacity-75 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none blur-2xl"
            style={{
              background:
                "radial-gradient(circle, rgba(255, 107, 53, 0.45) 0%, rgba(236, 72, 153, 0.5) 45%, rgba(34, 211, 238, 0.3) 75%, transparent 100%)",
            }}
          />

          <img
            src="/nextool-logo.png"
            alt="NexTool"
            className="relative z-10 w-22 h-22 sm:w-26 sm:h-26 w-[88px] h-[88px] sm:w-[104px] sm:h-[104px] object-contain transition-transform duration-300 group-hover:scale-105"
            style={{
              filter:
                "saturate(1.4) contrast(1.15) brightness(1.08) drop-shadow(0 10px 28px rgba(236,72,153,0.75)) drop-shadow(0 2px 14px rgba(34,211,238,0.5))",
            }}
            draggable={false}
          />

          <span className="relative z-10 text-[12.5px] sm:text-[13.5px] font-extrabold tracking-[0.28em] uppercase font-display bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent drop-shadow-[0_1px_10px_rgba(255,255,255,0.4)] select-none">
            NEXTOOL
          </span>

          {/* Créditos Oficiales MYNEXT */}
          <div className="relative z-10 mt-1 flex items-center justify-center gap-1 text-[11px] sm:text-[11.5px] font-display text-slate-400/90 select-none">
            <span className="italic font-normal">Powered by</span>
            <a
              href="https://mynextbymusa.com"
              target="_blank"
              rel="noopener noreferrer"
              className="italic font-bold text-white hover:text-[#C5A059] transition-colors underline decoration-white/30 hover:decoration-[#C5A059] underline-offset-2 tracking-wide cursor-pointer"
              title="Visitar mynextbymusa.com"
            >
              MYNEXT
            </a>
          </div>
        </div>
      </footer>

      {/* Liquid Glass Modal de Recuperación de Contraseña */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-md rounded-3xl bg-[#091122]/95 border border-white/20 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl text-white select-none overflow-hidden"
            >
              {/* Glows ambientales dentro del modal */}
              <div className="absolute -top-20 -left-20 w-48 h-48 bg-[#ff7236]/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-[#22d3ee]/20 rounded-full blur-3xl pointer-events-none" />

              {/* Botón Cerrar */}
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>

              {!forgotSuccess ? (
                <>
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#ff7236] to-[#ec4899] p-2.5 flex items-center justify-center shadow-lg shadow-[#ff7236]/30 shrink-0">
                      <KeyRound className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white font-sans">
                        Recuperar Contraseña
                      </h3>
                      <p className="text-xs text-neutral-400">
                        {brandBadge ? `Gestión oficial · ${brandBadge}` : "NexTool Cloud"}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-300 mb-5 leading-relaxed">
                    Introduce tu correo electrónico. Te enviaremos un enlace oficial de recuperación a tu Gmail para crear una nueva clave en segundos.
                  </p>

                  <form onSubmit={handleSendRecovery} className="flex flex-col gap-4">
                    {forgotError && (
                      <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-semibold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{forgotError}</span>
                      </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-neutral-300">
                        Correo Electrónico / Gmail
                      </label>
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="tu-correo@gmail.com"
                        className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#22d3ee] focus:ring-2 focus:ring-[#22d3ee]/25 transition-all"
                      />
                    </div>

                    <div className="pt-2">
                      <LiquidButton
                        type="submit"
                        disabled={forgotLoading}
                        className="w-full h-12 rounded-full font-bold text-xs sm:text-sm tracking-wide shadow-lg cursor-pointer"
                      >
                        {forgotLoading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                            <span>Enviando enlace a Gmail...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Send className="w-3.5 h-3.5" />
                            <span>Enviar enlace a mi correo</span>
                          </div>
                        )}
                      </LiquidButton>
                    </div>
                  </form>

                  {/* Vía Directa de Soporte con Musa */}
                  <div className="mt-6 pt-4 border-t border-white/10 flex flex-col items-center gap-2 text-center">
                    <span className="text-[11px] text-neutral-400">
                      ¿Prefieres ayuda inmediata o no tienes acceso al correo?
                    </span>
                    <a
                      href={`https://wa.me/34641617253?text=${encodeURIComponent(
                        `Hola Musa, soy del panel de ${brandBadge || 'NexTool'} (${forgotEmail || 'cliente'}) y necesito restablecer mi contraseña de acceso.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#22d3ee] hover:text-[#5eead4] font-semibold transition-colors"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Contactar por WhatsApp con Musa (Soporte Directo)</span>
                    </a>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-4 shadow-xl shadow-emerald-950/50">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 font-sans">
                    ¡Enlace enviado a tu Gmail!
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-xs mb-6">
                    Hemos enviado las instrucciones a <strong className="text-white">{forgotEmail}</strong>. Revisa tu bandeja de entrada o la carpeta de spam.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-6 py-2.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 text-xs font-bold text-white transition-all cursor-pointer shadow-lg"
                  >
                    Volver al inicio de sesión
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SpaceLogin;
