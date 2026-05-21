import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Editor from '@monaco-editor/react';
import { Code, Play, Terminal, CheckCircle, Brain, RefreshCw, Layers } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const CodingArena = () => {
  const token = useSelector((state) => state.auth.token);
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState(null);

  const fetchProblems = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/coding/problems`);
      const data = await response.json();
      if (data.success) {
        setProblems(data.problems);
        setSelectedProblem(data.problems[0]);
        setCode(data.problems[0].templates.javascript);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  // Update starter code when problem or language changes
  useEffect(() => {
    if (selectedProblem) {
      setCode(selectedProblem.templates[language] || '');
      setOutput(null);
    }
  }, [selectedProblem, language]);

  const handleRunCode = async () => {
    setRunning(true);
    setOutput(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/coding/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          problemTitle: selectedProblem.title,
          code,
          language
        })
      });

      const data = await response.json();
      if (data.success) {
        setOutput(data.submission);
      } else {
        alert(data.message || 'Execution error');
      }
    } catch (err) {
      console.error(err);
      alert('Cannot connect to compile services.');
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-73px)]">
        <Brain className="w-12 h-12 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto max-h-[calc(100vh-73px)]">
      {/* Left panel: Problem Description & Selectors */}
      <div className="flex flex-col space-y-6">
        <header className="flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Coding Interview Arena</span>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Code className="w-5 h-5 text-cyan-400" /> Algorithmic Practice
            </h2>
          </div>
          
          {/* Problem selector dropdown */}
          <select
            value={selectedProblem?.id}
            onChange={(e) => {
              const prob = problems.find((p) => p.id === e.target.value);
              setSelectedProblem(prob);
            }}
            className="bg-slate-900 border border-white/5 text-xs text-cyan-300 font-semibold px-4 py-2 rounded-xl focus:outline-none focus:border-cyan-500/50"
          >
            {problems.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </header>

        {selectedProblem && (
          <GlassCard className="flex-1 border border-white/10 p-6 space-y-6 flex flex-col justify-start rounded-3xl">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-white">{selectedProblem.title}</h3>
              <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${selectedProblem.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'}`}>
                {selectedProblem.difficulty}
              </span>
            </div>

            <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 text-xs text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">
              {selectedProblem.description}
            </div>

            {/* Test cases list */}
            <div className="space-y-3">
              <h4 className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Verification Test Cases:</h4>
              <div className="space-y-2">
                {selectedProblem.testCases.map((tc, idx) => (
                  <div key={idx} className="bg-slate-950/60 p-3 rounded-2xl border border-white/5 text-[11px] font-mono grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Input:</span>
                      <span className="text-slate-300">{tc.input}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Expected Output:</span>
                      <span className="text-cyan-400">{tc.output}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        )}
      </div>

      {/* Right panel: Monaco Editor & Output console */}
      <div className="flex flex-col space-y-6">
        <header className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {/* Language dropdown */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-slate-900 border border-white/5 text-xs text-slate-300 px-4 py-2 rounded-xl focus:outline-none"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>
          </div>

          <button
            onClick={handleRunCode}
            disabled={running}
            className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
          >
            {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>{running ? 'Compiling Solution...' : 'Run & Submit Code'}</span>
          </button>
        </header>

        {/* Code Monaco container */}
        <div className="flex-1 rounded-3xl border border-white/10 overflow-hidden shadow-2xl min-h-[300px] bg-[#1e1e1e]">
          <Editor
            height="100%"
            language={language === 'cpp' ? 'cpp' : language === 'java' ? 'java' : language}
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val || '')}
            options={{
              fontSize: 13,
              minimap: { enabled: false },
              automaticLayout: true,
              scrollBeyondLastLine: false,
              padding: { top: 16 }
            }}
          />
        </div>

        {/* Output console */}
        <div className="bg-slate-950 rounded-3xl border border-white/10 p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-1">
              <Terminal className="w-4 h-4" /> Execution Diagnostics
            </span>
            {output && (
              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${output.status === 'Accepted' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                {output.status}
              </span>
            )}
          </div>

          {!output ? (
            <div className="text-center py-6 text-xs text-slate-600 font-semibold uppercase tracking-wider">
              Submit code to activate compilation reports.
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Test cases verified:</span>
                <span className="font-bold text-slate-200">{output.testCasesPassed} / {output.testCasesTotal} Passed</span>
              </div>

              {/* Dynamic AI metrics */}
              <div className="grid grid-cols-2 gap-4 bg-slate-900/60 p-3 rounded-2xl border border-white/5">
                <div className="flex items-center space-x-2 text-slate-300">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <div className="space-y-0.5">
                    <span className="text-[8px] text-slate-500 uppercase tracking-widest block leading-none">Time Complexity</span>
                    <strong className="text-[11px] text-cyan-300">{output.aiFeedback?.timeComplexity || 'O(N)'}</strong>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-slate-300">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <div className="space-y-0.5">
                    <span className="text-[8px] text-slate-500 uppercase tracking-widest block leading-none">Space Complexity</span>
                    <strong className="text-[11px] text-purple-300">{output.aiFeedback?.spaceComplexity || 'O(1)'}</strong>
                  </div>
                </div>
              </div>

              {/* Bug and suggestion highlights */}
              {output.aiFeedback?.bugs && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-2xl space-y-1">
                  <span className="text-[9px] text-rose-400 font-black uppercase tracking-wider block">Identified Bug Risks:</span>
                  <p className="text-[11px] text-rose-200 font-medium leading-relaxed">{output.aiFeedback.bugs}</p>
                </div>
              )}

              {output.aiFeedback?.suggestions && (
                <div className="bg-cyan-500/10 border border-cyan-500/20 p-3 rounded-2xl space-y-1">
                  <span className="text-[9px] text-cyan-400 font-black uppercase tracking-wider block">AI Code Refactoring Tips:</span>
                  <p className="text-[11px] text-cyan-200 font-medium leading-relaxed">{output.aiFeedback.suggestions}</p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CodingArena;
