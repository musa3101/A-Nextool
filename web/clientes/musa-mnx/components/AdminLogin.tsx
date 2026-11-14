import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader2, ShieldCheck, Sparkles, AlertCircle, Lock, Mail, ArrowRight, Zap } from 'lucide-react';
import { musaConnector } from '../conector';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

// Particle Stars Canvas
function CosmicStarCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Stars collection
    const starsCount = 140;
    const stars = Array.from({ length: starsCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5 + 0.4,
      alpha: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.015 + 0.005,
      direction: Math.random() > 0.5 ? 1 : -1,
      color: Math.random() > 0.6 ? '#C5A059' : Math.random() > 0.3 ? '#38bdf8' : '#ffffff',
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      stars.forEach((star) => {
        star.alpha += star.speed * star.direction;
        if (star.alpha >= 1 || star.alpha <= 0.1) {
          star.direction *= -1;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = Math.max(0.05, Math.min(1, star.alpha));
        ctx.shadowBlur = star.radius * 4;
        ctx.shadowColor = star.color;
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('mynextbymusa@gmail.com');
  const [password, setPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Astronaut mouse parallax
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 24;
    const y = (clientY / innerHeight - 0.5) * 24;
    setMouseOffset({ x, y });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await musaConnector.login(email.trim(), password.trim(), rememberMe);
      if (res.success) {
        onLoginSuccess();
      } else {
        setErrorMessage(res.error || 'Credenciales incorrectas');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const fillQuickAccess = () => {
    setEmail('mynextbymusa@gmail.com');
    setPassword('admin');
    setRememberMe(true);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-full bg-[#08090C] text-slate-100 flex flex-col justify-center items-center overflow-hidden p-6 select-none font-['Satoshi']"
    >
      {/* Background Deep Cosmic Gradients */}
      <div className="absolute inset-0 bg-radial-[at_50%_40%] from-[#0f172a]/60 via-[#08090c] to-[#050608] pointer-events-none" />
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[#C5A059]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Particle Stars */}
      <CosmicStarCanvas />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-4xl mx-auto flex items-center justify-center gap-12">
        {/* Floating Astronaut Mascot (Mac & iPad Landscape) */}
        <motion.div
          animate={{
            x: mouseOffset.x * 1.4,
            y: mouseOffset.y * 1.4,
          }}
          transition={{ type: 'spring', damping: 28, stiffness: 55 }}
          className="hidden md:flex flex-col items-center justify-center pointer-events-none"
        >
          <motion.div
            animate={{
              y: [-12, 14, -12],
              rotate: [-2, 3, -2],
            }}
            transition={{
              duration: 6.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="relative"
          >
            <img
              src="/astronaut.svg"
              alt="NexTool Cosmic Mascot"
              className="w-48 lg:w-56 h-auto drop-shadow-[0_20px_40px_rgba(0,0,0,0.85)] filter contrast-125 select-none"
              draggable={false}
            />

            {/* Sparkle Gold Star */}
            <motion.div
              animate={{
                scale: [0.8, 1.25, 0.8],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute -right-2 top-1/2 -translate-y-1/2"
            >
              <Sparkles className="w-6 h-6 text-[#C5A059] drop-shadow-[0_0_12px_#C5A059]" />
            </motion.div>
          </motion.div>

          <div className="mt-4 text-center">
            <span className="font-['Clash_Display'] font-semibold text-xs text-[#C5A059] tracking-wider uppercase">
              Superadmin Atelier
            </span>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">NexTool Personal Edition</p>
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-[420px] bg-[#0B0E14]/90 backdrop-blur-2xl border border-white/10 ring-1 ring-inset ring-white/[0.04] rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.7)] space-y-6"
        >
          {/* Logo & Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-[#C5A059]/20 to-[#C5A059]/5 border border-[#C5A059]/30 flex items-center justify-center shadow-[0_0_20px_rgba(197,160,89,0.2)]">
              <span className="font-['Clash_Display'] font-bold text-lg tracking-wider text-[#C5A059]">MNX</span>
            </div>

            <div>
              <h1 className="font-['Clash_Display'] text-2xl font-semibold text-white tracking-tight">
                Musa MNX Atelier
              </h1>
              <p className="text-xs text-slate-400">Torre de Vigilancia & Centro de Mando</p>
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2.5 backdrop-blur-md"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                Email Superadmin
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mynextbymusa@gmail.com"
                  className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-[#08090C] border border-white/10 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#C5A059]/50 font-mono transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-10 rounded-xl bg-[#08090C] border border-white/10 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#C5A059]/50 font-mono transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-[#08090C] text-[#C5A059] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-xs text-slate-400 hover:text-slate-200 transition-colors">
                  Recordar sesión en este Mac / iPad
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-[#C5A059] to-[#DFC488] text-slate-950 font-semibold text-xs tracking-wide shadow-[0_4px_20px_rgba(197,160,89,0.3)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verificando Credenciales...
                </>
              ) : (
                <>
                  Acceder a Torre de Mando <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Superadmin Access Pill */}
          <div className="pt-2 border-t border-white/[0.06] text-center">
            <button
              type="button"
              onClick={fillQuickAccess}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[11px] text-slate-400 hover:text-white transition-all cursor-pointer font-mono"
            >
              <Zap className="w-3 h-3 text-[#C5A059]" /> Autocompletar Superadmin (Musa)
            </button>
          </div>
        </motion.div>
      </div>

      {/* Subtitle / Footer info */}
      <footer className="relative z-10 mt-8 text-center text-slate-600 text-[11px] font-mono">
        NexTool Superadmin Atelier · Exclusivo macOS & iPadOS · v1.0.0
      </footer>
    </div>
  );
};

