import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Award,
  Sparkles,
  Activity,
  Calendar,
  Layers,
  ArrowLeftRight,
  ShieldCheck,
  Zap,
  RotateCcw
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'radar' | 'timeline'
  const token = useSelector((state) => state.auth.token);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/analytics/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
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
          <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
          <h3 className="text-sm font-bold text-slate-300">Assembling Performance Analytics...</h3>
        </div>
      </div>
    );
  }

  // Fallback radar scores if backend scores are zero
  const rawScores = stats?.categoryScores || {
    communication: 60,
    technical: 60,
    leadership: 60,
    behavioral: 60,
    confidence: 60,
    criticalThinking: 60
  };

  // Map scores into Recharts standard format
  const radarData = [
    { subject: 'Communication', score: rawScores.communication, fullMark: 100 },
    { subject: 'Technical Skill', score: rawScores.technical, fullMark: 100 },
    { subject: 'Leadership', score: rawScores.leadership, fullMark: 100 },
    { subject: 'Behavioral', score: rawScores.behavioral, fullMark: 100 },
    { subject: 'Confidence', score: rawScores.confidence, fullMark: 100 },
    { subject: 'Critical Thinking', score: rawScores.criticalThinking, fullMark: 100 }
  ];

  // Map timeline data chronologically (left-to-right)
  const sortedTimeline = stats?.timeline 
    ? [...stats.timeline].reverse().map((item, index) => ({
        ...item,
        displayDate: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        index: index + 1
      }))
    : [];

  // Map categories for comparison bars
  const categoryChartData = Object.keys(rawScores).map((key) => {
    const label = key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
    return {
      name: label,
      score: rawScores[key]
    };
  });

  const getStrengthTag = (score) => {
    if (score >= 85) return { text: 'Expert', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    if (score >= 70) return { text: 'Advanced', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' };
    if (score >= 50) return { text: 'Intermediate', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    return { text: 'Novice', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-73px)]">
      {/* Header section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
            Skill Analytics <BarChart3 className="w-6 h-6 text-cyan-400" />
          </h1>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">
            Real-time competency assessment and behavioral tracking
          </p>
        </div>

        <button 
          onClick={fetchDashboardStats}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/5 font-semibold text-xs text-slate-300 hover:text-white transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </header>

      {/* Dials / Core stats row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-bl-full transition-all group-hover:bg-cyan-500/10" />
          <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-2">Voice Interview average</span>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-4xl font-black text-cyan-300">{stats?.interviewAverage || 0}%</h3>
            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">Active</span>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold uppercase mt-2">Aggregated from mock interviews</p>
        </GlassCard>

        <GlassCard className="p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full transition-all group-hover:bg-purple-500/10" />
          <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-2">GD Board Average</span>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-4xl font-black text-purple-300">{stats?.gdAverage || 0}%</h3>
            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">Simulated</span>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold uppercase mt-2">Active debate session ratings</p>
        </GlassCard>

        <GlassCard className="p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-bl-full transition-all group-hover:bg-pink-500/10" />
          <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-2">Coding success rate</span>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-4xl font-black text-pink-300">{stats?.codingSuccessRate || 0}%</h3>
            <span className="text-[10px] text-cyan-400 font-semibold bg-cyan-500/10 px-1.5 py-0.5 rounded">Sandboxed</span>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold uppercase mt-2">Test cases verified successfully</p>
        </GlassCard>
      </section>

      {/* Tabs Menu */}
      <div className="flex border-b border-white/5">
        {[
          { id: 'overview', label: 'Overall Competency', icon: Layers },
          { id: 'radar', label: 'Behavioral Radar', icon: Activity },
          { id: 'timeline', label: 'Performance Timeline', icon: TrendingUp }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 border-b-2 text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-300 bg-white/[0.02]'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.01]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Visualizer Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main interactive charts view based on active tab */}
        <GlassCard className="lg:col-span-2 p-6 flex flex-col justify-between space-y-6">
          {activeTab === 'overview' && (
            <>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  Category breakdown <Layers className="w-4 h-4 text-cyan-400" />
                </h3>
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Individual capability metrics</p>
              </div>

              <div className="h-[320px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryChartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#64748b" 
                      fontSize={9} 
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#64748b" 
                      domain={[0, 100]} 
                      fontSize={9} 
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        color: '#f8fafc',
                        fontFamily: 'sans-serif',
                        fontSize: '11px'
                      }}
                    />
                    <Bar dataKey="score" radius={[8, 8, 0, 0]} maxBarSize={45}>
                      {categoryChartData.map((entry, index) => {
                        const colors = ['#06b6d4', '#a855f7', '#ec4899', '#f97316', '#10b981', '#6366f1'];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {activeTab === 'radar' && (
            <>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  Competency Radar Assessment <Activity className="w-4 h-4 text-purple-400" />
                </h3>
                <p className="text-[10px] text-slate-500 font-semibold uppercase font-sans">Multi-dimensional behavioral map</p>
              </div>

              <div className="h-[320px] w-full flex items-center justify-center mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.08)" />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      stroke="#94a3b8" 
                      fontSize={9} 
                    />
                    <PolarRadiusAxis 
                      angle={30} 
                      domain={[0, 100]} 
                      stroke="#64748b" 
                      fontSize={8}
                    />
                    <Radar
                      name="Your Competencies"
                      dataKey="score"
                      stroke="#22d3ee"
                      fill="#06b6d4"
                      fillOpacity={0.25}
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} 
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {activeTab === 'timeline' && (
            <>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  Skill progression track <TrendingUp className="w-4 h-4 text-pink-400" />
                </h3>
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Historical scoring curves over time</p>
              </div>

              <div className="h-[320px] w-full mt-4">
                {sortedTimeline.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={sortedTimeline}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis 
                        dataKey="displayDate" 
                        stroke="#64748b" 
                        fontSize={9} 
                        tickLine={false}
                      />
                      <YAxis 
                        stroke="#64748b" 
                        domain={[0, 100]} 
                        fontSize={9}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(15, 23, 42, 0.9)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px',
                          color: '#f8fafc',
                          fontSize: '11px'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#06b6d4"
                        fillOpacity={1}
                        fill="url(#colorScore)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500 font-bold uppercase tracking-wider">
                    No Practice sessions registered yet
                  </div>
                )}
              </div>
            </>
          )}
        </GlassCard>

        {/* Sidebar panels: AI Coach & Capabilities Checklist */}
        <div className="space-y-6 flex flex-col justify-between h-full">
          {/* AI Advisor Panel */}
          <GlassCard className="p-6 space-y-4 border border-cyan-500/20 bg-cyan-950/10 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 animate-pulse-glow">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-cyan-300">AI Diagnostics Coach</h3>
                  <span className="text-[8px] text-slate-500 font-bold uppercase">Dynamic Advice Generator</span>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-slate-300 font-medium italic">
                "{stats?.aiRecommendations || 'Your AI Career Coach is waiting! Complete practice sessions in vocal interviews or group discussions to compile comprehensive skill feedback metrics.'}"
              </p>
            </div>
            
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-white/5 space-y-2 text-[10px]">
              <div className="flex items-center justify-between text-slate-500 font-bold uppercase">
                <span>ATS resume scan score</span>
                <span className="text-cyan-400">Available</span>
              </div>
              <p className="text-slate-400 leading-normal">
                Optimize your CV using our PDF parser to automatically resolve skill gaps targeted to your preferred job roles.
              </p>
              <Link to="/resume-analyzer" className="block text-center text-cyan-300 font-black hover:text-cyan-200 transition-colors uppercase pt-1 border-t border-white/5">
                Audit Resume Now
              </Link>
            </div>
          </GlassCard>

          {/* Core Strengths Checklist */}
          <GlassCard className="p-6 space-y-4 flex-1">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                Skills Index <Calendar className="w-4 h-4 text-emerald-400" />
              </h3>
              <p className="text-[10px] text-slate-500 font-semibold uppercase">Category metrics breakdown</p>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[220px] pr-1">
              {Object.keys(rawScores).map((key) => {
                const score = rawScores[key];
                const label = key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (str) => str.toUpperCase());
                const tag = getStrengthTag(score);

                return (
                  <div key={key} className="space-y-1.5 p-2 bg-slate-900/40 rounded-xl border border-white/5 hover:border-slate-800 transition-all">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-300">{label}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${tag.color}`}>
                        {tag.text} ({score}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-cyan-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Activity Timeline List (Detailed Log) */}
      <GlassCard className="p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            Detailed Practice Timeline <Activity className="w-4 h-4 text-cyan-400" />
          </h3>
          <p className="text-[10px] text-slate-500 font-semibold uppercase">Full history of mocks, debates, and compilation cycles</p>
        </div>

        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
          {stats?.timeline && stats.timeline.length > 0 ? (
            stats.timeline.map((act, idx) => (
              <div 
                key={idx} 
                className="p-4 bg-slate-900/40 hover:bg-slate-900/60 rounded-2xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-200"
              >
                <div className="flex items-start space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-xl shrink-0 border border-white/5 shadow-inner">
                    {act.activityType === 'Interview' ? '🎙️' : act.activityType === 'GD' ? '👥' : act.activityType === 'Coding' ? '💻' : '📄'}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-200">{act.description}</h4>
                    <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-semibold uppercase mt-0.5">
                      <span className="text-cyan-400/90">{act.activityType} Challenge</span>
                      <span>•</span>
                      <span>{new Date(act.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">
                  {act.score > 0 ? (
                    <div className="text-right">
                      <span className="text-xs font-black text-cyan-300 bg-cyan-500/10 border border-cyan-500/25 px-2.5 py-1 rounded-full">
                        Score: {act.score}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-600 font-black uppercase tracking-wider border border-white/5 px-2 py-1 rounded-full">
                      Logged
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs font-bold uppercase tracking-wider">
              Practice timeline diagnostics clear. Open the Interview Setup to log your first record!
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default Analytics;
