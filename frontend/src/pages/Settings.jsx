import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfileSuccess } from '../redux/authSlice';
import { 
  User, 
  Settings as SettingsIcon, 
  Sparkles, 
  Save, 
  Flame, 
  Award, 
  Key, 
  FileText, 
  Layers, 
  GraduationCap, 
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

const Settings = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);

  // Form states
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [experience, setExperience] = useState(0);
  const [targetDifficulty, setTargetDifficulty] = useState('Medium');
  const [skillsInput, setSkillsInput] = useState('');
  
  // Notice messages
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  // Initialize form fields from Redux user state
  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      if (user.profile) {
        setRole(user.profile.role || '');
        setExperience(user.profile.experience || 0);
        setTargetDifficulty(user.profile.targetDifficulty || 'Medium');
        setSkillsInput(user.profile.skills ? user.profile.skills.join(', ') : '');
      }
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      // Split skills input by commas and trim whitespace
      const skillsArray = skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username,
          profile: {
            role,
            experience: Number(experience),
            targetDifficulty,
            skills: skillsArray
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        dispatch(updateProfileSuccess({
          username: data.username,
          profile: data.profile
        }));
        setSuccessMsg('Your career preferences and profile details have been saved!');
        
        // Clear message after 4 seconds
        setTimeout(() => {
          setSuccessMsg('');
        }, 4000);
      } else {
        setErrorMsg(data.message || 'Failed to update career parameters.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error. Failed to reach career database.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-73px)]">
      {/* Header banner */}
      <header>
        <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
          Career Preferences <SettingsIcon className="w-6 h-6 text-cyan-400" />
        </h1>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">
          Configure job roles, target interview difficulties, and track badges
        </p>
      </header>

      {/* Main settings grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core preferences form */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-6 md:p-8">
            <div className="flex items-center space-x-2.5 mb-6">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">System Parameters</h3>
                <span className="text-[9px] text-slate-500 font-bold uppercase">Dynamic custom interview configuration</span>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* Notifications */}
              {successMsg && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-2xl flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}
              {errorMsg && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-2xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Grid fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Username */}
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">
                    Display Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      placeholder="Username"
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-950/60 border border-white/5 text-xs text-white focus:outline-none focus:border-cyan-500/40 transition-colors font-medium"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">
                    Account Email (Read-Only)
                  </label>
                  <div className="relative">
                    <Info className="absolute left-3.5 top-3 w-4 h-4 text-slate-600" />
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-950/40 border border-white/5 text-xs text-slate-500 cursor-not-allowed font-medium"
                    />
                  </div>
                </div>

                {/* Target Job Role */}
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">
                    Target Job Role
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      required
                      placeholder="e.g. Frontend Engineer, Product Manager"
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-950/60 border border-white/5 text-xs text-white focus:outline-none focus:border-cyan-500/40 transition-colors font-medium"
                    />
                  </div>
                </div>

                {/* Experience Level */}
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">
                    Experience Level (Years)
                  </label>
                  <div className="relative">
                    <Layers className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="number"
                      min="0"
                      max="40"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-950/60 border border-white/5 text-xs text-white focus:outline-none focus:border-cyan-500/40 transition-colors font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Target Difficulty */}
              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">
                  Target AI Difficulty
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['Easy', 'Medium', 'Hard'].map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setTargetDifficulty(diff)}
                      className={`py-2 rounded-xl border text-xs font-bold uppercase transition-all ${
                        targetDifficulty === diff
                          ? 'bg-cyan-500/10 border-cyan-500/35 text-cyan-300 shadow-inner'
                          : 'bg-slate-950/40 border-white/5 text-slate-500 hover:text-slate-300 hover:border-slate-800'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Skills Tags */}
              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">
                  Core Skills tags (Comma-separated)
                </label>
                <textarea
                  rows="3"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="React, Node.js, Systems Architecture, AWS, Python..."
                  className="w-full p-4 rounded-xl bg-slate-950/60 border border-white/5 text-xs text-white focus:outline-none focus:border-cyan-500/40 transition-colors font-medium resize-none leading-relaxed"
                />
                <p className="text-[9px] text-slate-500 leading-normal uppercase">
                  These skill parameters dynamically direct the Gemini mock question engine.
                </p>
              </div>

              {/* Save actions */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 font-bold text-xs text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50 glow-cyan"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving Changes...' : 'Save Preferences'}</span>
                </button>
              </div>
            </form>
          </GlassCard>
        </div>

        {/* Gamification, badges and overview */}
        <div className="space-y-6">
          {/* Gamification Stats Card */}
          <GlassCard className="p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-bl-full transition-all group-hover:bg-orange-500/10" />
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">Streak Metrics</h3>
              <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[40px] font-black text-orange-400 leading-none">{user?.stats?.streak || 0}</span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest block mt-0.5">Consecutive Days Active</span>
              </div>

              <div className="space-y-1.5">
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/5">
                  <div
                    className="bg-orange-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(((user?.stats?.streak || 0) / 7) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[9px] text-slate-500 leading-normal uppercase">
                  {user?.stats?.streak >= 3
                    ? 'Excellent job maintaining consistency!'
                    : 'Practice mock interview sets daily to compound your streak!'}
                </p>
              </div>
            </div>
          </GlassCard>

          {/* XP & Rewards */}
          <GlassCard className="p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full transition-all group-hover:bg-purple-500/10" />
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">Accrued Points</h3>
              <Award className="w-5 h-5 text-purple-400" />
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[40px] font-black text-purple-300 leading-none">{user?.stats?.xp || 0}</span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest block mt-0.5">Career Experience Points (XP)</span>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 text-[9px] text-slate-500 font-bold uppercase">
                Submit vocal responses, debug complex structures, and upload resumes to build XP points dynamically!
              </div>
            </div>
          </GlassCard>

          {/* Gamified Badges Container */}
          <GlassCard className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">Earned Badges</h3>
              <Award className="w-5 h-5 text-cyan-400" />
            </div>

            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {user?.stats?.badges && user.stats.badges.length > 0 ? (
                user.stats.badges.map((badge, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-900/60 rounded-xl border border-white/5 flex items-center space-x-3 text-left hover:border-cyan-500/20 transition-all cursor-default"
                  >
                    <div className="text-xl shrink-0">{badge.icon || '🔥'}</div>
                    <div className="space-y-0.5 min-w-0">
                      <h4 className="text-[11px] font-bold text-white leading-tight truncate">{badge.name}</h4>
                      <p className="text-[9px] text-slate-500 font-medium leading-none">{badge.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  No badges unlocked yet.
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Settings;
