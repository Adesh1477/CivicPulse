import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Megaphone,
  BarChart3,
  Users,
  FileText,
  CheckCircle2,
  ShieldCheck,
  Users2,
  Building2
} from "lucide-react";
import welcomeIllustration from "../../assets/civic-welcome-illustration.jpg";

export default function WelcomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF3E0] text-slate-800 font-sans relative overflow-x-hidden selection:bg-blue-600 selection:text-white">
      {/* Decorative Ambient Background Elements & Doodles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Subtle Top-Left Cloud Outline */}
        <svg
          className="absolute -top-6 left-12 w-48 h-24 text-amber-900/10"
          viewBox="0 0 100 50"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20,38 Q10,38 10,28 Q10,18 22,18 Q26,8 40,10 Q52,4 65,14 Q78,10 82,24 Q92,26 90,38 Z" />
        </svg>

        {/* Subtle Top-Right Cloud Outline */}
        <svg
          className="absolute top-8 right-16 w-56 h-28 text-amber-900/10"
          viewBox="0 0 100 50"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20,38 Q10,38 10,28 Q10,18 22,18 Q26,8 40,10 Q52,4 65,14 Q78,10 82,24 Q92,26 90,38 Z" />
        </svg>

        {/* Bottom Left Dot Matrix Grid */}
        <svg className="absolute bottom-16 left-6 w-32 h-32 opacity-20 text-amber-800" fill="currentColor">
          <pattern id="dot-grid-pattern" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#dot-grid-pattern)" />
        </svg>

        {/* Bottom Left Faint Botanical Leaves */}
        <svg
          className="absolute -bottom-8 -left-8 w-60 h-60 text-amber-800/15"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        >
          <path d="M10,90 Q40,60 50,20 Q60,60 90,90" />
          <path d="M30,68 Q15,55 20,40 Q35,45 35,60" />
          <path d="M45,45 Q30,30 38,15 Q50,25 48,40" />
          <path d="M55,45 Q70,30 62,15 Q50,25 52,40" />
          <path d="M70,68 Q85,55 80,40 Q65,45 65,60" />
        </svg>

        {/* Bottom Right Faint Botanical Leaves */}
        <svg
          className="absolute -bottom-10 -right-6 w-64 h-64 text-amber-800/15"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        >
          <path d="M90,90 Q60,60 50,20 Q40,60 10,90" />
          <path d="M70,68 Q85,55 80,40 Q65,45 65,60" />
          <path d="M55,45 Q70,30 62,15 Q50,25 52,40" />
          <path d="M45,45 Q30,30 38,15 Q50,25 48,40" />
          <path d="M30,68 Q15,55 20,40 Q35,45 35,60" />
        </svg>
      </div>

      {/* Top Header */}
      <header className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pt-6 sm:pt-8 flex items-center justify-between z-20 relative">
        {/* Left: CivicPulse Branding */}
        <Link to="/" className="flex items-center gap-3 group select-none">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#1d4ed8] flex items-center justify-center text-white shadow-md shadow-blue-600/25 group-hover:scale-105 transition-transform">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" opacity="0.3" />
              <path d="M4 12h4l2.5-5 4 10 2.5-5h3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div className="flex items-baseline">
              <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Civic</span>
              <span className="text-xl sm:text-2xl font-black text-[#1d4ed8] tracking-tight">Pulse</span>
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-500 block -mt-0.5">
              MUNICIPAL PLATFORM
            </span>
          </div>
        </Link>
      </header>

      {/* Main Hero Section */}
      <main className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center py-6 sm:py-8 z-10 relative">
        {/* Left Column: Heading, Mini Features, CTA */}
        <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center text-left">
          {/* Badge: Building Better Cities, Together */}
          <div className="mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/70 border border-blue-200/80 text-[#1d4ed8] font-bold text-xs tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[#1d4ed8] animate-pulse"></span>
              Building Better Cities, Together
            </span>
          </div>

          {/* Large Hero Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black tracking-tight leading-[1.08]">
            <span className="text-slate-900 block">Welcome to</span>
            <span className="text-[#1d4ed8] block mt-0.5">CivicPulse</span>
          </h1>

          {/* Short Blue Accent Underline */}
          <div className="w-12 h-1 bg-[#1d4ed8] rounded-full mt-3 mb-4" />

          {/* Supporting Text */}
          <p className="text-sm sm:text-base text-slate-600 font-normal mb-6 max-w-md leading-relaxed">
            Empowering citizens and municipalities to build cleaner, safer and smarter cities together.
          </p>

          {/* 3 Compact Feature Highlights */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6 max-w-lg">
            {/* 1. Report Issues */}
            <div className="flex items-start gap-2 sm:gap-2.5">
              <div className="p-1.5 sm:p-2 rounded-xl bg-blue-100/80 text-[#1d4ed8] shrink-0 mt-0.5">
                <Megaphone className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-900 leading-tight">Report Issues</h2>
                <p className="text-[11px] text-slate-500 leading-snug mt-0.5">Raise a complaint in seconds</p>
              </div>
            </div>

            {/* 2. Track Progress */}
            <div className="flex items-start gap-2 sm:gap-2.5">
              <div className="p-1.5 sm:p-2 rounded-xl bg-emerald-100/80 text-emerald-600 shrink-0 mt-0.5">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-900 leading-tight">Track Progress</h2>
                <p className="text-[11px] text-slate-500 leading-snug mt-0.5">Real-time updates on resolution</p>
              </div>
            </div>

            {/* 3. Better Cities */}
            <div className="flex items-start gap-2 sm:gap-2.5">
              <div className="p-1.5 sm:p-2 rounded-xl bg-purple-100/80 text-purple-600 shrink-0 mt-0.5">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-900 leading-tight">Better Cities</h2>
                <p className="text-[11px] text-slate-500 leading-snug mt-0.5">Data-driven decisions for a smarter future</p>
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Link
              to="/citizen"
              className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#1d4ed8] hover:bg-[#1e40af] active:scale-[0.98] text-white text-sm sm:text-base font-bold rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all group cursor-pointer"
            >
              <span>Continue to Platform</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Security Tag */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mt-4 select-none">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Secure. Transparent. Connected.</span>
          </div>
        </div>

        {/* Right Column: Hero City Park Illustration seamlessly integrated */}
        <div className="lg:col-span-6 xl:col-span-7 flex items-center justify-center lg:justify-end select-none relative">
          {/* Subtle Warm Atmospheric Radial Glow */}
          <div className="absolute -inset-4 sm:-inset-8 bg-[radial-gradient(ellipse_at_center,_#FFFDF2_0%,_#FCF3DA_65%,_transparent_100%)] opacity-75 blur-2xl pointer-events-none -z-10 scale-110" />

          <div className="relative w-full max-w-2xl overflow-visible">
            <img
              src={welcomeIllustration}
              alt="CivicPulse Illustrated City Scene"
              className="w-full h-auto object-contain max-h-[490px]"
              style={{
                maskImage:
                  "radial-gradient(ellipse 95% 92% at 50% 50%, black 72%, rgba(0,0,0,0.5) 88%, transparent 100%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 95% 92% at 50% 50%, black 72%, rgba(0,0,0,0.5) 88%, transparent 100%)"
              }}
              loading="eager"
            />

            {/* Soft Edge Blending Gradients */}
            <div className="absolute inset-y-0 left-0 w-14 bg-gradient-to-r from-[#FCF3DA] via-[#FCF3DA]/50 to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-[#FCF3DA] via-[#FCF3DA]/50 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[#FCF3DA] via-[#FCF3DA]/50 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#FCF3DA] via-[#FCF3DA]/50 to-transparent pointer-events-none" />
          </div>
        </div>
      </main>

      {/* Bottom Floating Feature Strip */}
      <section className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 mb-6 z-20 relative">
        {/* Soft Ambient Warm Glow behind the feature strip */}
        <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-amber-200/15 via-orange-100/25 to-amber-200/15 rounded-[24px] blur-xl opacity-70 pointer-events-none -z-10" />

        <div className="bg-[radial-gradient(ellipse_at_center,_#FFFFFF_0%,_#FFFDF7_65%,_#FAF4E7_100%)] backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-[0_8px_30px_rgba(180,140,90,0.06)] border border-[#EBDCC0]/70 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Item 1: Report Issues */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#1d4ed8] text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20 ring-4 ring-blue-100/40">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Report Issues</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                Easily report civic issues in your area.
              </p>
            </div>
          </div>

          {/* Item 2: Track Progress */}
          <div className="flex items-center gap-4 lg:border-l lg:border-[#E8DFC8]/60 lg:pl-6">
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/20 ring-4 ring-emerald-100/40">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Track Progress</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                Real-time updates on issue resolution.
              </p>
            </div>
          </div>

          {/* Item 3: Safe & Secure */}
          <div className="flex items-center gap-4 lg:border-l lg:border-[#E8DFC8]/60 lg:pl-6">
            <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-orange-500/20 ring-4 ring-orange-100/40">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Safe & Secure</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                Your data is protected and always private.
              </p>
            </div>
          </div>

          {/* Item 4: Stronger Communities */}
          <div className="flex items-center gap-4 lg:border-l lg:border-[#E8DFC8]/60 lg:pl-6">
            <div className="w-12 h-12 rounded-full bg-[#6366f1] text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-500/20 ring-4 ring-indigo-100/40">
              <Users2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Stronger Communities</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                Working together for better tomorrow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Branding Line */}
      <footer className="w-full py-4 text-center z-10 relative">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center gap-3">
          <div className="h-px bg-amber-300/60 flex-1 max-w-[120px] sm:max-w-[200px]" />
          <div className="flex items-center gap-2 text-amber-700/80 text-[11px] font-semibold tracking-wide select-none">
            <span>◇</span>
            <Building2 className="w-3.5 h-3.5 text-amber-600/80 inline -mt-0.5" />
            <span>CivicPulse Municipal Infrastructure • Connected City Grid</span>
            <span>◇</span>
          </div>
          <div className="h-px bg-amber-300/60 flex-1 max-w-[120px] sm:max-w-[200px]" />
        </div>
      </footer>
    </div>
  );
}
