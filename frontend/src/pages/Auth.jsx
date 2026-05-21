import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { authStart, authSuccess, authFailure } from '../redux/authSlice';
import GlassCard from '../components/GlassCard';
import { KeyRound, Mail, User as UserIcon, LogIn, ArrowRight } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!email || !password || (!isLogin && !username)) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    dispatch(authStart());
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin ? { email, password } : { username, email, password };

    try {
      const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        dispatch(authSuccess({ user: data, token: data.token }));
        navigate('/dashboard');
      } else {
        const errText = data.message || 'Authentication failed. Please verify credentials.';
        dispatch(authFailure(errText));
        setErrorMessage(errText);
      }
    } catch (err) {
      console.error(err);
      dispatch(authFailure('Network failure. Cannot reach backend server.'));
      setErrorMessage('Network connection error. Please ensure the backend is running.');
    }
  };

  return (
    <div className="w-full flex items-center justify-center min-h-[calc(100vh-73px)] px-6 relative bg-gradient-cyber">
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-purple-500/10 blur-[150px] pointer-events-none" />

      <GlassCard className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 p-0 rounded-3xl overflow-hidden border border-white/10 glow-cyan">
        
        {/* Left Interactive Tip Box (hidden on mobile) */}
        <div className="bg-gradient-to-br from-cyan-600/20 via-purple-600/10 to-pink-500/5 p-10 flex flex-col justify-between hidden md:flex border-r border-white/5">
          <div className="space-y-4">
            <span className="text-[10px] font-black text-cyan-300 uppercase tracking-widest bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
              Tips from AI Coach
            </span>
            <h3 className="text-2xl font-black leading-snug">
              Master the "STAR" Method in Behavioral Rooms
            </h3>
            <p className="text-xs leading-relaxed text-slate-400 font-medium">
              Always articulate:
              <br />• <strong>S</strong>ituation: Define the context.
              <br />• <strong>T</strong>ask: Explain your direct challenge.
              <br />• <strong>A</strong>ction: Detail your steps.
              <br />• <strong>R</strong>esult: Showcase measurable outcomes.
            </p>
          </div>

          <div className="p-4 bg-slate-900/60 rounded-2xl border border-white/5 space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">Featured Challenge</span>
            <h4 className="text-xs font-bold text-slate-300">Merge Intervals (Medium)</h4>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center">
              +150 XP Reward
            </span>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="p-8 md:p-12 flex flex-col justify-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              {isLogin ? 'Sign in to access mock interviews' : 'Begin practicing with personalized AI tracks'}
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Username</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-4 top-3" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-slate-950/60 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-xs focus:outline-none focus:border-cyan-500/50 text-white"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-950/60 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-xs focus:outline-none focus:border-cyan-500/50 text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Password</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-4 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/60 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-xs focus:outline-none focus:border-cyan-500/50 text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 font-bold text-xs text-white shadow-lg transition-all"
            >
              {loading ? (
                <span>Loading...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>{isLogin ? 'Sign In' : 'Register Now'}</span>
                </>
              )}
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setErrorMessage('');
              }}
              className="text-xs text-slate-400 hover:text-cyan-400 transition-colors inline-flex items-center space-x-1"
            >
              <span>{isLogin ? "New here? Create an account" : "Have an account? Log in instead"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default Auth;
