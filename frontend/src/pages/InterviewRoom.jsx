import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Mic, StopCircle, CheckCircle, Brain, Volume2, Award, ArrowLeft, ClipboardList } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import WebcamMonitor from '../components/WebcamMonitor';
import AudioVisualizer from '../components/AudioVisualizer';

const InterviewRoom = () => {
  const { id } = useParams();
  const token = useSelector((state) => state.auth.token);

  const [interview, setInterview] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Speech Recognition hooks
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  // Webcam aggregates
  const [emotions, setEmotions] = useState({
    confidence: 80,
    focus: 85,
    calmness: 85,
    stress: 15
  });
  const emotionHistory = useRef([]);

  // Final summary state
  const [isCompleted, setIsCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);

  const fetchInterviewDetails = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/interviews/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setInterview(data.interview);
        if (data.interview.status === 'Completed') {
          setIsCompleted(true);
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error(err);
      setError('Cannot connect to API server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchInterviewDetails();
    }
  }, [token, id]);

  // Read question aloud when current question changes
  useEffect(() => {
    if (interview && interview.questions && interview.questions[currentIdx] && !isCompleted) {
      speakQuestion(interview.questions[currentIdx].questionText);
      setTranscript('');
    }
  }, [interview, currentIdx, isCompleted]);

  const speakQuestion = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Setup native Web Speech Recognition
  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please use Google Chrome.');
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript((prev) => prev + finalTranscript);
    };

    rec.onstart = () => setIsRecording(true);
    rec.onend = () => setIsRecording(false);
    rec.onerror = (e) => console.error('Speech recognition error:', e);

    recognitionRef.current = rec;
    rec.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleEmotionTracking = (liveEmotions) => {
    setEmotions(liveEmotions);
    emotionHistory.current.push(liveEmotions);
  };

  const handleSubmitAnswer = async () => {
    stopRecording();
    setLoading(true);

    const questionItem = interview.questions[currentIdx];

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/interviews/${id}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          questionId: questionItem._id,
          userAnswer: transcript || 'No answer provided verbally.'
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update local interview object
        const updatedQuestions = [...interview.questions];
        updatedQuestions[currentIdx] = data.question;
        setInterview({ ...interview, questions: updatedQuestions });

        // Increment current index
        if (currentIdx < interview.questions.length - 1) {
          setCurrentIdx(currentIdx + 1);
        } else {
          // Finished all questions! Complete mock
          handleCompleteInterview();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteInterview = async () => {
    setCompleting(true);

    // Compute average emotion tracking metrics
    let avgConfidence = 80;
    let avgFocus = 85;
    let avgCalmness = 85;
    let avgStress = 15;

    if (emotionHistory.current.length > 0) {
      const size = emotionHistory.current.length;
      avgConfidence = Math.round(emotionHistory.current.reduce((sum, e) => sum + e.confidence, 0) / size);
      avgFocus = Math.round(emotionHistory.current.reduce((sum, e) => sum + e.focus, 0) / size);
      avgCalmness = Math.round(emotionHistory.current.reduce((sum, e) => sum + e.calmness, 0) / size);
      avgStress = Math.round(emotionHistory.current.reduce((sum, e) => sum + e.stress, 0) / size);
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/interviews/${id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          confidence: avgConfidence,
          focus: avgFocus,
          calmness: avgCalmness,
          stress: avgStress
        })
      });

      const data = await response.json();
      if (data.success) {
        setInterview(data.interview);
        setIsCompleted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCompleting(false);
    }
  };

  if (loading && !interview) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-73px)]">
        <Brain className="w-12 h-12 text-cyan-400 animate-spin" />
      </div>
    );
  }

  // COMPLETE REPORT VIEW RENDERING
  if (isCompleted && interview) {
    return (
      <div className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-73px)]">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-white">Interview Performance Diagnostics</h1>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mt-1">
              Role: {interview.role} • Score: {interview.overallScore}/100
            </p>
          </div>
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 px-4 py-2 bg-slate-900 border border-white/5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return Dashboard</span>
          </Link>
        </header>

        {/* Global Summary Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="flex flex-col justify-center items-center text-center p-8 space-y-2">
            <Award className="w-12 h-12 text-cyan-400" />
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Aggregate Grade</span>
            <h2 className="text-5xl font-black text-white">{interview.overallScore}%</h2>
            <span className="text-[9px] text-emerald-400 font-bold uppercase">Technical & soft skills compiled</span>
          </GlassCard>

          <GlassCard className="md:col-span-2 p-8 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
              🎙️ Overall AI Feedback Summary
            </h3>
            <p className="text-xs leading-relaxed text-slate-300 font-medium italic">
              "{interview.overallFeedback}"
            </p>
            <div className="grid grid-cols-4 gap-4 bg-slate-950/60 p-3 rounded-2xl border border-white/5 text-center mt-2">
              <div>
                <span className="text-[9px] text-slate-500 font-bold uppercase block">CONFIDENCE</span>
                <span className="text-xs font-black text-cyan-300">{interview.emotionMetrics?.confidence || 80}%</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 font-bold uppercase block">FOCUS RATE</span>
                <span className="text-xs font-black text-purple-300">{interview.emotionMetrics?.focus || 85}%</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 font-bold uppercase block">CALMNESS</span>
                <span className="text-xs font-black text-pink-300">{interview.emotionMetrics?.calmness || 85}%</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 font-bold uppercase block">STRESS FACTOR</span>
                <span className="text-xs font-black text-rose-400">{interview.emotionMetrics?.stress || 15}%</span>
              </div>
            </div>
          </GlassCard>
        </section>

        {/* Detailed Question breakdown */}
        <section className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <ClipboardList className="w-5 h-5" /> Question By Question Diagnostics
          </h3>

          <div className="space-y-4">
            {interview.questions.map((q, idx) => (
              <GlassCard key={q._id} className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Question {idx+1} ({q.category})</span>
                    <h4 className="text-sm font-black text-slate-100">{q.questionText}</h4>
                  </div>
                  <span className="text-xs font-black text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                    {q.score}/100
                  </span>
                </div>

                <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 space-y-2">
                  <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider block">Your Transcribed Response:</span>
                  <p className="text-xs leading-relaxed text-slate-300 font-medium italic">"{q.userAnswer}"</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  <div className="space-y-1 bg-slate-950/60 p-3 rounded-2xl border border-white/5">
                    <h5 className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Correctness</h5>
                    <p className="text-xs leading-relaxed text-slate-400 font-semibold">{q.correctnessFeedback}</p>
                  </div>
                  <div className="space-y-1 bg-slate-950/60 p-3 rounded-2xl border border-white/5">
                    <h5 className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Articulation</h5>
                    <p className="text-xs leading-relaxed text-slate-400 font-semibold">{q.communicationFeedback}</p>
                  </div>
                  <div className="space-y-1 bg-slate-950/60 p-3 rounded-2xl border border-white/5">
                    <h5 className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Grammar & Hesitations</h5>
                    <p className="text-xs leading-relaxed text-slate-400 font-semibold">
                      {q.grammarFeedback} <br />
                      <strong className="text-[10px] text-orange-400 mt-1 block uppercase">Filler Words Count: {q.fillerWordsCount}</strong>
                    </p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // ACTIVE INTERVIEW TESTING ROOM
  return (
    <div className="flex-1 p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-y-auto max-h-[calc(100vh-73px)] relative">
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />

      {/* Left panel: Camera and audio visualizer */}
      <div className="flex flex-col space-y-6">
        <h2 className="text-lg font-black uppercase tracking-wider text-slate-400">Live Video & Vocal Streams</h2>
        <WebcamMonitor onEmotionUpdate={handleEmotionTracking} />
        <AudioVisualizer isRecording={isRecording} />
      </div>

      {/* Right panel: Active Questioning Dialog */}
      <div className="flex flex-col space-y-6">
        <h2 className="text-lg font-black uppercase tracking-wider text-slate-400">Mock Question Pane</h2>

        {interview && interview.questions && interview.questions[currentIdx] && (
          <GlassCard className="flex-1 border border-white/10 p-6 md:p-8 flex flex-col justify-between space-y-6">
            
            {/* Header info */}
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <div>
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Question {currentIdx + 1} of {interview.questions.length}</span>
                <h4 className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mt-0.5">Category: {interview.questions[currentIdx].category}</h4>
              </div>
              
              <button
                onClick={() => speakQuestion(interview.questions[currentIdx].questionText)}
                className="p-2.5 rounded-xl bg-slate-900 border border-white/5 hover:bg-slate-800 text-cyan-400"
                title="Speak question again"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Glowing Question bubble */}
            <div className="py-6 text-center">
              <h3 className="text-lg md:text-xl font-bold leading-relaxed text-slate-100">
                "{interview.questions[currentIdx].questionText}"
              </h3>
            </div>

            {/* Recording Controls & Transcript box */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Answer Transcript (editable):</span>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${isRecording ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-slate-950 text-slate-500'}`}>
                  {isRecording ? 'Mic Active (Listening)' : 'Mic Standby'}
                </span>
              </div>

              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Click 'Record Answer' below to speak your response, or type directly here if you prefer..."
                className="w-full h-32 bg-slate-950/60 border border-white/5 rounded-2xl p-4 text-xs focus:outline-none focus:border-cyan-500/50 text-white placeholder-slate-600 leading-relaxed"
              />

              <div className="flex gap-4">
                {isRecording ? (
                  <button
                    onClick={stopRecording}
                    className="flex-1 flex items-center justify-center space-x-2 py-3.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl font-bold text-xs hover:bg-rose-500/30 transition-all shadow-md"
                  >
                    <StopCircle className="w-4 h-4" />
                    <span>Stop Recording</span>
                  </button>
                ) : (
                  <button
                    onClick={startRecording}
                    className="flex-1 flex items-center justify-center space-x-2 py-3.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl font-bold text-xs hover:bg-cyan-500/30 transition-all shadow-md"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Record Answer</span>
                  </button>
                )}

                <button
                  onClick={handleSubmitAnswer}
                  disabled={completing}
                  className="flex-1 flex items-center justify-center space-x-2 py-3.5 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white rounded-xl font-bold text-xs shadow-lg transition-all"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{currentIdx === interview.questions.length - 1 ? 'Submit & Finalize' : 'Submit & Next'}</span>
                </button>
              </div>
            </div>

          </GlassCard>
        )}
      </div>
    </div>
  );
};

export default InterviewRoom;
