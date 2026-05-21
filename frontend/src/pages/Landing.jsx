import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mic, Code, Users, FileCheck, ArrowRight, TrendingUp, ShieldCheck } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const Landing = () => {
  return (
    <div className="w-full flex flex-col items-center bg-gradient-cyber min-h-screen">
      {/* Hero Section */}
      <header className="relative w-full max-w-7xl px-6 pt-20 pb-16 flex flex-col items-center text-center space-y-8 overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-black uppercase tracking-widest animate-pulse-glow">
          <Sparkles className="w-4 h-4" />
          <span>Next-Generation Career Coaching AI</span>
        </div>

        <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-tight">
          Supercharge Your Career Prep with{' '}
          <span className="text-gradient-cyan-purple">Real-Time AI Coaching</span>
        </h1>

        <p className="text-slate-400 text-base md:text-xl max-w-2xl leading-relaxed font-medium">
          Practice interactive voice interviews, participate in simulated multi-candidate Group Discussions, master coding arena tests, and scan resume ATS scores instantly.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link
            to="/auth"
            className="flex items-center space-x-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95 glow-cyan text-sm"
          >
            <span>Start Practicing Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#features"
            className="px-8 py-4 rounded-2xl bg-slate-900/60 hover:bg-slate-900 text-slate-300 font-bold border border-white/5 hover:border-cyan-500/30 transition-all text-sm"
          >
            Explore Core Features
          </a>
        </div>
      </header>

      {/* Highlights Dashboard Mock */}
      <section className="w-full max-w-6xl px-6 pb-24">
        <GlassCard className="border border-white/10 glow-cyan p-1.5 md:p-3 bg-slate-950/80 rounded-3xl">
          <div className="bg-slate-900/40 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between gap-8 border border-white/5">
            <div className="flex flex-col space-y-1">
              <span className="text-xs text-slate-500 font-black uppercase tracking-widest">Active Candidates</span>
              <span className="text-3xl font-black text-cyan-300">142,500+</span>
            </div>
            <div className="w-[1px] h-12 bg-white/10 hidden md:block" />
            <div className="flex flex-col space-y-1">
              <span className="text-xs text-slate-500 font-black uppercase tracking-widest">AI Sessions Run</span>
              <span className="text-3xl font-black text-purple-300">2.1 Million+</span>
            </div>
            <div className="w-[1px] h-12 bg-white/10 hidden md:block" />
            <div className="flex flex-col space-y-1">
              <span className="text-xs text-slate-500 font-black uppercase tracking-widest">Coding Submissions</span>
              <span className="text-3xl font-black text-pink-300">890k+</span>
            </div>
            <div className="w-[1px] h-12 bg-white/10 hidden md:block" />
            <div className="flex flex-col space-y-1">
              <span className="text-xs text-slate-500 font-black uppercase tracking-widest">Avg. Success Bump</span>
              <span className="text-3xl font-black text-emerald-400">+42% Higher</span>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="w-full max-w-7xl px-6 py-20 border-t border-white/5 relative">
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-pink-500/5 blur-[120px] pointer-events-none" />

        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Unleash Your Full Interview Potential
          </h2>
          <p className="text-slate-400 font-medium">
            No more static questionnaires. Leverage multi-modal AI evaluating what you say, how you speak, and the way you program.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Card 1 */}
          <GlassCard className="flex flex-col space-y-4 p-8">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold shadow-md">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">AI Voice Interview</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              Vocal speech recognition and synthesis. AI speaks questions and grades answers based on correctness, confidence, and filler word ratios.
            </p>
          </GlassCard>

          {/* Card 2 */}
          <GlassCard className="flex flex-col space-y-4 p-8">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold shadow-md">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">GD Boardroom</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              Join roundtables with multiple virtual AI debate candidates carrying custom personalities. Recieve deep conflict-management reviews.
            </p>
          </GlassCard>

          {/* Card 3 */}
          <GlassCard className="flex flex-col space-y-4 p-8">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold shadow-md">
              <Code className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Coding Arena</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              Split-layout Monaco IDE supporting multiple languages. Evaluate space and time complexities using instant sandboxed compilers.
            </p>
          </GlassCard>

          {/* Card 4 */}
          <GlassCard className="flex flex-col space-y-4 p-8">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shadow-md">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Resume ATS Auditor</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              Upload PDF resumes to extract text instantly. Recieve scoring updates matching preferred roles, format critiques, and skill maps.
            </p>
          </GlassCard>
        </div>
      </section>

      {/* SaaS Trust Section */}
      <footer className="w-full max-w-7xl px-6 py-12 flex flex-col md:flex-row items-center justify-between border-t border-white/5 text-slate-500 text-xs font-semibold gap-4">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Secure AES encryption & API keys routing protection</span>
        </div>
        <p>© 2026 AI Interview Practice & GD Analyzer Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
