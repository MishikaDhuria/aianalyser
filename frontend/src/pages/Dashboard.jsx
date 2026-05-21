import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Mic, Users, Code, FileText, Flame, Trophy, Award, History, ArrowUpRight, Sparkles } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '')}/api/analytics/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardStats();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="flex-1 p-6 md:p-8 flex items-center justify-center min-h-[calc(100vh-73px)]">
        <div className="flex flex-col items-center space-y-4">
          <Trophy className="w-12 h-12 text-cyan-400 animate-bounce" />
          <h3 className="text-sm font-bold text-slate-300">Assembling Career Diagnostics...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-73px)]">
      {/* Header welcome banner */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2 capitalize">
            Hello, {user?.username} <Sparkles className="w-5 h-5 text-cyan-400 fill-cyan-400" />
          </h1>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">
            Target Role: {user?.profile?.role || "Software Engineer"} • Difficulty: {user?.profile?.targetDifficulty || "Medium"}
          </p>
        </div>

        <Link
          to="/interview-setup"
          className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 font-bold text-xs text-white shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95 glow-cyan"
        >
          <span>Quick Start Practice</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </header>

      {/* Dials / Core stats row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="flex items-center justify-between p-6">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Mock Averages</span>
            <h3 className="text-3xl font-black text-cyan-300">{stats?.interviewAverage || 0}%</h3>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Voice Interviews</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
            <Mic className="w-6 h-6" />
          </div>
        </GlassCard>

        <GlassCard className="flex items-center justify-between p-6">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">GD Board Average</span>
            <h3 className="text-3xl font-black text-purple-300">{stats?.gdAverage || 0}%</h3>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Group Discussions</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </GlassCard>

        <GlassCard className="flex items-center justify-between p-6">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Code Success rate</span>
            <h3 className="text-3xl font-black text-pink-300">{stats?.codingSuccessRate || 0}%</h3>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Test Cases Passed</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold">
            <Code className="w-6 h-6" />
          </div>
        </GlassCard>
      </section>

      {/* Gamification row: XP, Streaks & Badges */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Streak & XP tracker */}
        <GlassCard className="p-6 flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Streak Diagnostics</h3>
            <Flame className="w-5 h-5 text-orange-500 animate-bounce" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-5xl font-black text-orange-400">{stats?.streak || 0}</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Day Streak</span>
          </div>
          <div className="space-y-2">
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/5">
              <div
                className="bg-orange-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(((stats?.streak || 0) / 7) * 100, 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed font-semibold uppercase">
              {stats?.streak >= 3
                ? 'Excellent consistency! Keep going to unlock the Streak Badges.'
                : 'Practice consecutive days to build a powerful streak!'}
            </p>
          </div>
        </GlassCard>

        {/* Badges and Rewards Grid */}
        <GlassCard className="lg:col-span-2 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Gamification Badges</h3>
            <Award className="w-5 h-5 text-purple-400" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {stats?.badges && stats.badges.length > 0 ? (
              stats.badges.map((badge, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/60 p-3 rounded-2xl border border-white/5 flex items-center space-x-3 text-left hover:border-purple-500/35 transition-all cursor-default"
                >
                  <div className="text-2xl">{badge.icon || '🔥'}</div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-white leading-tight">{badge.name}</h4>
                    <p className="text-[9px] text-slate-500 font-medium leading-none">{badge.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-6 text-xs text-slate-500 font-semibold uppercase tracking-wider">
                No badges earned yet. Complete activities to unlock!
              </div>
            )}
          </div>
        </GlassCard>
      </section>

      {/* AI Advice & Practice timeline */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Coach recommendations */}
        <GlassCard className="p-6 flex flex-col justify-between space-y-4 border border-cyan-500/20 bg-cyan-950/10">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 animate-pulse">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-cyan-300">AI Career Coach Suggestions</h3>
              <span className="text-[9px] text-slate-500 font-bold uppercase">Dynamic Advice Generator</span>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-slate-300 font-medium italic">
            "{stats?.aiRecommendations || 'Practicing answers will immediately unlock custom metrics recommendations.'}"
          </p>
          <div className="p-3 bg-slate-950/60 rounded-2xl border border-white/5 text-[10px] text-slate-500 font-bold uppercase flex justify-between items-center">
            <span>Scan updated resumes to review core gaps</span>
            <Link to="/resume-analyzer" className="text-cyan-400 hover:text-cyan-300 transition-colors">Go →</Link>
          </div>
        </GlassCard>

        {/* Practice History timeline */}
        <GlassCard className="lg:col-span-2 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Practice Timeline</h3>
            <History className="w-5 h-5 text-slate-400" />
          </div>

          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2">
            {stats?.timeline && stats.timeline.length > 0 ? (
              stats.timeline.map((act, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-900/40 rounded-2xl border border-white/5 flex items-center justify-between hover:bg-slate-900/60 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">
                      {act.activityType === 'Interview' ? '🎙️' : act.activityType === 'GD' ? '👥' : act.activityType === 'Coding' ? '💻' : '📄'}
                    </span>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-200">{act.description}</h4>
                      <p className="text-[9px] text-slate-500 font-medium uppercase">
                        {new Date(act.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {act.score > 0 && (
                    <span className="text-xs font-black text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                      {act.score}%
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Practice history empty.
              </div>
            )}
          </div>
        </GlassCard>
      </section>
    </div>
  );
};

export default Dashboard;
