"use client";

import { useActionState, useEffect, useState } from "react";
import { login, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#f5e6fd] via-[#e8f0fe] to-[#fdfbfb]">
      {/* Light Soft Glow Background Orbs */}
      <div className="absolute top-[-10%] left-[-15%] w-[600px] h-[600px] rounded-full bg-violet-300/20 blur-[130px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[700px] h-[700px] rounded-full bg-sky-200/30 blur-[140px] animate-pulse [animation-delay:1.5s]" />
      <div className="absolute top-[25%] left-[50%] w-[450px] h-[450px] rounded-full bg-emerald-200/20 blur-[100px] animate-pulse [animation-delay:3s]" />

      {/* Ambient Floating Particle Micro-animations */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-violet-400/10 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Main Glassmorphic Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[32px] p-8 md:p-10 shadow-[0_20px_50px_rgba(139,92,246,0.05)] transition-all hover:shadow-[0_25px_60px_rgba(139,92,246,0.08)]">
          
          {/* Brand Header */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-3 mb-5">
              
              {/* Logos Container */}
              <div className="flex items-center justify-center gap-4">
                {/* Saved Swatch Paints Logo */}
                <img
                  src="/swatchpaints.png"
                  alt="Swatch Paints Logo"
                  className="h-12 w-auto object-contain"
                />
                
                {/* Soft Divider */}
                <div className="w-px h-8 bg-slate-200" />
                
                {/* Sharma Industries Day Logo */}
                <img
                  src="/logo_day_cropped.png"
                  alt="Sharma Industries Logo"
                  className="h-7 w-auto object-contain"
                />
              </div>

              {/* Title & Powered By */}
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-800">
                  Swatch Paints
                </h1>
                <p className="text-xs font-bold tracking-wider text-slate-400 mt-1 uppercase">
                  Powered by Sharma Industries
                </p>
                <div className="inline-block mt-3 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black tracking-widest uppercase text-primary">
                  ERP Software Suite
                </div>
              </div>

            </div>
          </div>

          {/* Form Errors */}
          {state.error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs text-center font-bold animate-shake flex items-center justify-center gap-2">
              <span>⚠️</span>
              {state.error}
            </div>
          )}

          {/* Authentication Form */}
          <form action={formAction} className="space-y-6">
            
            {/* Phone Input */}
            <div className="space-y-2">
              <label htmlFor="phone" className="text-xs font-bold text-slate-400 uppercase tracking-widest block pl-1">
                Phone Number
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                </div>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="Enter 10-digit phone number"
                  maxLength={10}
                  required
                  autoComplete="tel"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all duration-300 hover:bg-slate-100/50"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-bold text-slate-400 uppercase tracking-widest block pl-1">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all duration-300 hover:bg-slate-100/50"
                />
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-primary text-white font-bold text-sm shadow-lg shadow-violet-500/10 hover:shadow-violet-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] cursor-pointer"
            >
              {isPending ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Authenticating...
                </span>
              ) : (
                "Authorize & Sign In"
              )}
            </button>

          </form>

          {/* Quick-Logins Drawer */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 mb-4 text-center uppercase tracking-widest font-black">
              Developer Credentials Sandbox
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <form action={formAction}>
                <input type="hidden" name="phone" value="9999999999" />
                <input type="hidden" name="password" value="admin123" />
                <button type="submit" disabled={isPending} className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200/80 transition-all cursor-pointer">
                  CEO Office
                </button>
              </form>
              <form action={formAction}>
                <input type="hidden" name="phone" value="6666666666" />
                <input type="hidden" name="password" value="admin123" />
                <button type="submit" disabled={isPending} className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200/80 transition-all cursor-pointer">
                  Auditor (CA)
                </button>
              </form>
              <form action={formAction}>
                <input type="hidden" name="phone" value="8888888888" />
                <input type="hidden" name="password" value="admin123" />
                <button type="submit" disabled={isPending} className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200/80 transition-all cursor-pointer">
                  Dealer Portal
                </button>
              </form>
              <form action={formAction}>
                <input type="hidden" name="phone" value="7777777777" />
                <input type="hidden" name="password" value="admin123" />
                <button type="submit" disabled={isPending} className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200/80 transition-all cursor-pointer">
                  Salesman
                </button>
              </form>
              <form action={formAction}>
                <input type="hidden" name="phone" value="9000000001" />
                <input type="hidden" name="password" value="admin123" />
                <button type="submit" disabled={isPending} className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200/80 transition-all cursor-pointer">
                  Painter Portal
                </button>
              </form>
            </div>
          </div>

          {/* Secure access notice */}
          <div className="mt-8 pt-4 border-t border-slate-100 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Authorized Personnel Access Only
            </p>
          </div>

        </div>

        {/* Brand Copyright */}
        <p className="text-center text-xs text-slate-400 mt-6 font-bold">
          © {new Date().getFullYear()} Swatch Paints. Powered by Sharma Industries.
        </p>
      </div>
    </div>
  );
}
