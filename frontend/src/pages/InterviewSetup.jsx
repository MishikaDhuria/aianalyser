import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Mic, ArrowRight, Brain, AlertCircle } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const InterviewSetup = () => {
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();

  const [role, setRole] = useState(user?.profile?.role || 'Full Stack Developer');
  const [skills, setSkills] = useState(user?.profile?.skills?.join(', ') || 'React, Node.js, JavaScript');
  const [experience, setExperience] = useState(user?.profile?.experience || 2);
  const [difficulty, setDifficulty] = useState('Medium');
  const [type, setType] = useState('Mixed');
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formattedSkills = skills.split(',').map((s) => s.trim()).filter((s) => s.length > 0);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/interviews/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          role,
          skills: formattedSkills,
          experience,
          difficulty,
          type,
          numQuestions,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        navigate(`/interview-room/${data.interview._id}`);
      } else {
        setError(data.message || 'Generation failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Network connection error. Please ensure the backend server is online.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 flex items-center justify-center min-h-[calc(100vh-73px)] relative overflow-y-auto">
      {/* Background neon glows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />

      {loading ? (
        <div className="flex flex-col items-center space-y-4 text-center">
          <Brain className="w-16 h-16 text-cyan-400 animate-spin" />
          <h3 className="text-lg font-black text-white">AI Technical Recruiter is Assembling Questions...</h3>
          <p className="text-xs text-slate-500 font-semibold max-w-sm">
            We are curating custom behavioral, technical, and scenario questions specific to {role} with skills: {skills}.
          </p>
        </div>
      ) : (
        <GlassCard className="w-full max-w-3xl border border-white/10 p-8 md:p-12 glow-cyan rounded-3xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400">
              <Mic className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">AI Interview Room Setup</h2>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">
                Generate speech mock interviews tailored to your targets
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 mb-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Target Role */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Target Career Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Frontend Developer"
                className="w-full bg-slate-950/60 border border-white/5 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:border-cyan-500/50 text-white"
                required
              />
            </div>

            {/* Target Skills */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Core Technical Skills (comma separated)</label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="React, Node.js, JavaScript"
                className="w-full bg-slate-950/60 border border-white/5 rounded-xl px-4 py-3.5 text-xs focus:outline-none focus:border-cyan-500/50 text-white"
                required
              />
            </div>

            {/* Experience Slider */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex justify-between">
                <span>Years of Experience</span>
                <span className="text-cyan-400">{experience} Years</span>
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={experience}
                onChange={(e) => setExperience(parseInt(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-950/60"
              />
            </div>

            {/* Questions count slider */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex justify-between">
                <span>Total Mock Questions</span>
                <span className="text-cyan-400">{numQuestions} Questions</span>
              </label>
              <input
                type="range"
                min="3"
                max="10"
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-950/60"
              />
            </div>

            {/* Interview Type buttons */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Interview Categories</label>
              <div className="grid grid-cols-2 gap-3">
                {['Technical', 'HR', 'Behavioral', 'Mixed'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`py-3.5 rounded-xl border text-xs font-bold transition-all ${
                      type === t
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 glow-cyan'
                        : 'bg-slate-950/60 text-slate-400 border-white/5 hover:border-slate-800'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty buttons */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Target Difficulty</label>
              <div className="grid grid-cols-3 gap-3">
                {['Easy', 'Medium', 'Hard'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`py-3.5 rounded-xl border text-xs font-bold transition-all ${
                      difficulty === d
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 glow-purple'
                        : 'bg-slate-950/60 text-slate-400 border-white/5 hover:border-slate-800'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="md:col-span-2 w-full flex items-center justify-center space-x-2 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 font-bold text-xs text-white shadow-lg transition-all"
            >
              <span>Construct AI Mock Room</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </GlassCard>
      )}
    </div>
  );
};

export default InterviewSetup;
