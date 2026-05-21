import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Users, Send, Mic, StopCircle, Award, Brain, ArrowLeft, Bot, MessageCircle } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import AudioVisualizer from '../components/AudioVisualizer';

const GDRoom = () => {
  const token = useSelector((state) => state.auth.token);
  const [topic, setTopic] = useState("Is Artificial Intelligence replacing human creativity, or augmenting it?");
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [turnLoading, setTurnLoading] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState('');
  
  // Speech Recording
  const [isRecording, setIsRecording] = useState(false);
  const [userSpeech, setUserSpeech] = useState('');
  const recognitionRef = useRef(null);

  // Complete Assessment
  const [isCompleted, setIsCompleted] = useState(false);
  const [evalLoading, setEvalLoading] = useState(false);

  const transcriptEndRef = useRef(null);

  const scrollToBottom = () => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session?.transcript, activeSpeaker]);

  // Handle active speaker visual pulses
  useEffect(() => {
    if (session?.transcript && session.transcript.length > 0) {
      const lastLine = session.transcript[session.transcript.length - 1];
      setActiveSpeaker(lastLine.speaker);
    }
  }, [session?.transcript]);

  const handleStartGD = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/gd/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ topic })
      });
      const data = await response.json();
      if (data.success) {
        setSession(data.gdSession);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startSpeechRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition not supported in this browser. Please use Chrome.');
      return;
    }
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      setUserSpeech((prev) => prev + finalTranscript);
    };

    rec.onstart = () => setIsRecording(true);
    rec.onend = () => setIsRecording(false);
    recognitionRef.current = rec;
    rec.start();
  };

  const stopSpeechRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleSendTurn = async (e) => {
    e.preventDefault();
    if (!userSpeech.trim() || turnLoading) return;

    stopSpeechRecording();
    setTurnLoading(true);
    const textToSend = userSpeech;
    setUserSpeech('');

    // Instant optimist push to transcript to feel responsive
    const tempTranscript = [...session.transcript, { speaker: 'User', text: textToSend }];
    setSession({ ...session, transcript: tempTranscript });
    setActiveSpeaker('User');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/gd/${session._id}/turn`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userStatement: textToSend })
      });
      const data = await response.json();
      if (data.success) {
        setSession({ ...session, transcript: data.transcript });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTurnLoading(false);
    }
  };

  const handleEvaluateGD = async () => {
    setEvalLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/gd/${session._id}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setSession(data.gdSession);
        setIsCompleted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEvalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-73px)]">
        <Brain className="w-12 h-12 text-cyan-400 animate-spin" />
      </div>
    );
  }

  // GD EVALUATION REPORT PANEL
  if (isCompleted && session) {
    return (
      <div className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-73px)]">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-white">GD Evaluation Report</h1>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mt-1">
              Topic: {session.topic}
            </p>
          </div>
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 px-4 py-2 bg-slate-900 border border-white/5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Radar summary */}
          <GlassCard className="flex flex-col items-center justify-center text-center p-8 space-y-3">
            <Award className="w-14 h-14 text-purple-400" />
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Discussion score</span>
            <h2 className="text-6xl font-black text-white">{session.evaluation.overallScore}%</h2>
            <span className="text-[9px] text-emerald-400 font-bold uppercase">Moderator review finalized</span>
          </GlassCard>

          {/* Breakdown cards */}
          <GlassCard className="lg:col-span-2 p-8 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
              ⚖️ Assessor Summary Feedback
            </h3>
            <p className="text-xs leading-relaxed text-slate-300 font-medium italic">
              "{session.evaluation.overallFeedback}"
            </p>
            <div className="grid grid-cols-5 gap-3 bg-slate-950/60 p-3 rounded-2xl border border-white/5 text-center mt-2">
              <div>
                <span className="text-[9px] text-slate-500 font-bold uppercase block">LEADERSHIP</span>
                <span className="text-xs font-black text-cyan-300">{session.evaluation.leadership}%</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 font-bold uppercase block">CRITICAL THINKING</span>
                <span className="text-xs font-black text-purple-300">{session.evaluation.criticalThinking}%</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 font-bold uppercase block">RELEVANCE</span>
                <span className="text-xs font-black text-pink-300">{session.evaluation.relevance}%</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 font-bold uppercase block">COMMUNICATION</span>
                <span className="text-xs font-black text-emerald-400">{session.evaluation.communication}%</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 font-bold uppercase block">CONFIDENCE</span>
                <span className="text-xs font-black text-rose-400">{session.evaluation.confidence}%</span>
              </div>
            </div>
          </GlassCard>
        </section>
      </div>
    );
  }

  // ACTIVE BOARDROOM TABLE DISCUSSION
  if (session) {
    return (
      <div className="flex-1 p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto max-h-[calc(100vh-73px)]">
        {/* Left / Middle: Table & Speakers Transcript */}
        <div className="lg:col-span-2 flex flex-col space-y-6">
          <header className="space-y-1">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Active Boardroom Table</span>
            <h2 className="text-md font-bold text-slate-200">Topic: "{session.topic}"</h2>
          </header>

          {/* AI Roundtable seats */}
          <div className="grid grid-cols-4 gap-4">
            {/* Sarah seat */}
            <div className={`p-4 rounded-2xl border text-center transition-all ${activeSpeaker === 'Sarah Miller' ? 'bg-cyan-500/20 border-cyan-400 glow-cyan animate-pulse' : 'bg-slate-900/60 border-white/5'}`}>
              <div className="text-2xl mb-1">👩‍💻</div>
              <h4 className="text-xs font-bold text-white leading-none">Sarah</h4>
              <span className="text-[8px] text-slate-500 uppercase tracking-widest mt-0.5 block">Analytical</span>
            </div>

            {/* Rahul seat */}
            <div className={`p-4 rounded-2xl border text-center transition-all ${activeSpeaker === 'Rahul Sharma' ? 'bg-purple-500/20 border-purple-400 glow-purple animate-pulse' : 'bg-slate-900/60 border-white/5'}`}>
              <div className="text-2xl mb-1">👨‍💼</div>
              <h4 className="text-xs font-bold text-white leading-none">Rahul</h4>
              <span className="text-[8px] text-slate-500 uppercase tracking-widest mt-0.5 block">Assertive</span>
            </div>

            {/* Emily seat */}
            <div className={`p-4 rounded-2xl border text-center transition-all ${activeSpeaker === 'Emily Chen' ? 'bg-pink-500/20 border-pink-400 glow-cyan animate-pulse' : 'bg-slate-900/60 border-white/5'}`}>
              <div className="text-2xl mb-1">👩‍💼</div>
              <h4 className="text-xs font-bold text-white leading-none">Emily</h4>
              <span className="text-[8px] text-slate-500 uppercase tracking-widest mt-0.5 block">Diplomatic</span>
            </div>

            {/* User seat */}
            <div className={`p-4 rounded-2xl border text-center transition-all ${activeSpeaker === 'User' ? 'bg-emerald-500/20 border-emerald-400 animate-pulse' : 'bg-slate-900/60 border-white/5'}`}>
              <div className="text-2xl mb-1">🎓</div>
              <h4 className="text-xs font-bold text-white leading-none">You</h4>
              <span className="text-[8px] text-slate-500 uppercase tracking-widest mt-0.5 block">Candidate</span>
            </div>
          </div>

          {/* Transcript logs */}
          <div className="flex-1 bg-slate-950/60 border border-white/5 rounded-3xl p-6 h-64 overflow-y-auto space-y-4 flex flex-col justify-start">
            {session.transcript.map((line, idx) => (
              <div
                key={idx}
                className={`flex flex-col space-y-1 max-w-[80%] ${line.speaker === 'User' ? 'ml-auto text-right items-end' : 'mr-auto text-left items-start'}`}
              >
                <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">
                  {line.speaker === 'User' ? 'You' : line.speaker}
                </span>
                <div
                  className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    line.speaker === 'User'
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : line.speaker === 'Sarah Miller'
                      ? 'bg-cyan-900/40 text-cyan-100 border border-cyan-500/10 rounded-tl-none'
                      : line.speaker === 'Rahul Sharma'
                      ? 'bg-purple-900/40 text-purple-100 border border-purple-500/10 rounded-tl-none'
                      : 'bg-pink-900/40 text-pink-100 border border-pink-500/10 rounded-tl-none'
                  }`}
                >
                  {line.text}
                </div>
              </div>
            ))}
            {turnLoading && (
              <div className="flex items-center space-x-2 text-slate-500 animate-pulse">
                <Bot className="w-4 h-4 animate-spin text-cyan-400" />
                <span className="text-xs font-bold uppercase tracking-widest">Sarah, Rahul, and Emily are debating...</span>
              </div>
            )}
            <div ref={transcriptEndRef} />
          </div>
        </div>

        {/* Right side: Recording turn and moderator submit */}
        <div className="flex flex-col space-y-6">
          <h2 className="text-lg font-black uppercase tracking-wider text-slate-400">Vocal controls</h2>

          <GlassCard className="flex-1 border border-white/10 p-6 flex flex-col justify-between space-y-6 rounded-3xl">
            <div className="space-y-2">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-300">Submit Your Debate Turn</h3>
              <p className="text-[10px] leading-relaxed text-slate-500 font-semibold">
                Contribute your arguments to the group. Use voice transcription to speak naturally.
              </p>
            </div>

            <AudioVisualizer isRecording={isRecording} />

            <div className="space-y-4">
              <textarea
                value={userSpeech}
                onChange={(e) => setUserSpeech(e.target.value)}
                placeholder="Click 'Record Speech' to speak your turn, or type your debate points here..."
                className="w-full h-32 bg-slate-950 border border-white/5 rounded-2xl p-4 text-xs focus:outline-none focus:border-cyan-500/50 text-white placeholder-slate-600 leading-relaxed"
              />

              <div className="flex gap-4">
                {isRecording ? (
                  <button
                    onClick={stopSpeechRecording}
                    className="flex-1 flex items-center justify-center space-x-2 py-3.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl font-bold text-xs hover:bg-rose-500/30 transition-all"
                  >
                    <StopCircle className="w-4 h-4" />
                    <span>Stop Mic</span>
                  </button>
                ) : (
                  <button
                    onClick={startSpeechRecording}
                    className="flex-1 flex items-center justify-center space-x-2 py-3.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl font-bold text-xs hover:bg-cyan-500/30 transition-all"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Record Speech</span>
                  </button>
                )}

                <button
                  onClick={handleSendTurn}
                  disabled={turnLoading || !userSpeech.trim()}
                  className="p-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              onClick={handleEvaluateGD}
              disabled={evalLoading}
              className="w-full flex items-center justify-center space-x-2 py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all border border-white/5"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{evalLoading ? 'Running Evaluation...' : 'End & Request Assess'}</span>
            </button>
          </GlassCard>
        </div>
      </div>
    );
  }

  // GD TOPIC SETUP SELECTION
  return (
    <div className="flex-1 p-6 md:p-8 flex items-center justify-center min-h-[calc(100vh-73px)] relative overflow-y-auto">
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />

      <GlassCard className="w-full max-w-2xl border border-white/10 p-8 md:p-12 glow-cyan rounded-3xl space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400">
            <Users className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">AI Group Discussion boardroom</h2>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">
              Simulate debate table discussions with virtual AI candidates
            </p>
          </div>
        </div>

        <form onSubmit={handleStartGD} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Select or Custom Debate Topic</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Is Artificial Intelligence replacing human creativity, or augmenting it?"
              className="w-full h-24 bg-slate-950 border border-white/5 rounded-2xl p-4 text-xs focus:outline-none focus:border-cyan-500/50 text-white placeholder-slate-600 leading-relaxed"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 space-y-2">
              <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider block">Sarah Miller</span>
              <p className="text-[10px] text-slate-400 font-medium">Logical and fact-driven. Sarah raised standard counter-arguments using concrete statistics.</p>
            </div>
            <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 space-y-2">
              <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider block">Rahul Sharma</span>
              <p className="text-[10px] text-slate-400 font-medium">Assertive and bold leader. Rahul focuses on structural points and conflict remediation.</p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
          >
            Launch Roundtable Table
          </button>
        </form>
      </GlassCard>
    </div>
  );
};

export default GDRoom;
