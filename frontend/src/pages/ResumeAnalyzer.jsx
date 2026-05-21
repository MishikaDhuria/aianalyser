import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FileUp, FileCheck, Brain, AlertCircle, RefreshCw, BarChart, Settings, ListPlus } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const ResumeAnalyzer = () => {
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);

  const [file, setFile] = useState(null);
  const [targetRole, setTargetRole] = useState(user?.profile?.role || 'Full Stack Developer');
  const [targetSkills, setTargetSkills] = useState(user?.profile?.skills?.join(', ') || 'React, Node.js, JavaScript');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);
  const [reportsHistory, setReportsHistory] = useState([]);

  const fetchReportsHistory = async () => {
    try {
      const response = await fetch(`${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '')}/api/resume/reports`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setReportsHistory(data.reports);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchReportsHistory();
    }
  }, [token]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF resume to analyze.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('targetRole', targetRole);
    formData.append('targetSkills', targetSkills);

    try {
      const response = await fetch(`${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '')}/api/resume/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setReport(data.report);
        fetchReportsHistory(); // Refresh history list
      } else {
        setError(data.message || 'ATS Analysis failed.');
      }
    } catch (err) {
      console.error(err);
      setError('Cannot connect to ATS services.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-73px)] relative">
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />

      <header className="space-y-1">
        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest font-sans">Resume Diagnostics</span>
        <h1 className="text-3xl font-black text-white flex items-center gap-2">
          <FileCheck className="w-8 h-8 text-cyan-400" /> ATS Resume Auditor
        </h1>
      </header>

      {loading ? (
        <div className="flex flex-col items-center space-y-4 text-center justify-center py-20">
          <Brain className="w-16 h-16 text-cyan-400 animate-spin" />
          <h3 className="text-lg font-black text-white">Gemini is Auditing Resume against ATS Criteria...</h3>
          <p className="text-xs text-slate-500 font-semibold max-w-sm leading-relaxed">
            We are extracting textual blocks, grading keyword weights, and verifying structural formatting rules.
          </p>
        </div>
      ) : report ? (
        /* ATS AUDIT REPORT CONTAINER */
        <div className="space-y-8">
          <header className="flex justify-between items-center bg-slate-900/60 p-4 rounded-2xl border border-white/5">
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-slate-400">Scanned File: "{report.fileName}"</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Role Audited: {targetRole}</p>
            </div>
            <button
              onClick={() => { setReport(null); setFile(null); }}
              className="flex items-center space-x-1 px-4 py-2 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold hover:bg-cyan-500/30"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Scan Another</span>
            </button>
          </header>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Circle Match dial */}
            <GlassCard className="flex flex-col items-center justify-center text-center p-8 space-y-3">
              <BarChart className="w-12 h-12 text-cyan-400" />
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">ATS Match Score</span>
              <h2 className="text-6xl font-black text-white">{report.atsScore}%</h2>
              <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${report.atsScore >= 75 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'}`}>
                {report.atsScore >= 75 ? 'Optimal ATS Level' : 'Needs Optimization'}
              </span>
            </GlassCard>

            {/* Keyword tag matches */}
            <GlassCard className="lg:col-span-2 p-8 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                <ListPlus className="w-4 h-4" /> Identified Skill & Keyword Gaps
              </h3>
              <p className="text-xs leading-relaxed text-slate-400 font-semibold">
                Adding these industry keywords to your work experiences can increase your visibility on ATS filters:
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {report.skillGap && report.skillGap.length > 0 ? (
                  report.skillGap.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-black uppercase text-pink-300 bg-pink-500/10 px-3 py-1.5 rounded-full border border-pink-500/20"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 font-medium">Optimal keyword alignment found!</span>
                )}
              </div>
            </GlassCard>
          </section>

          {/* Breakdown Tips */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard className="p-6 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">Format & Structure Audit</h3>
              <ul className="space-y-2 text-xs text-slate-400 leading-relaxed font-semibold">
                {report.formattingTips && report.formattingTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-rose-400 font-black">✕</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>

            <GlassCard className="p-6 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">Suggested Work bullet points</h3>
              <ul className="space-y-2 text-xs text-slate-400 leading-relaxed font-semibold">
                {report.improvements && report.improvements.map((imp, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-emerald-400 font-black">✓</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </section>

          {/* Complete detailed coach review */}
          <GlassCard className="p-8 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-300">📄 Complete Career Coach Review</h3>
            <p className="text-xs leading-relaxed text-slate-300 font-medium whitespace-pre-wrap">{report.fullReport}</p>
          </GlassCard>
        </div>
      ) : (
        /* RESUME DRAG AND UPLOAD ZONE */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Settings panel */}
          <div className="flex flex-col space-y-6">
            <h2 className="text-lg font-black uppercase tracking-wider text-slate-400">Target career targets</h2>
            
            <GlassCard className="p-6 space-y-4 rounded-3xl border border-white/5">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Target Role Preference</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs focus:outline-none text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Target Skills tags</label>
                <textarea
                  value={targetSkills}
                  onChange={(e) => setTargetSkills(e.target.value)}
                  className="w-full h-24 bg-slate-950 border border-white/5 rounded-xl p-4 text-xs focus:outline-none text-white leading-relaxed"
                  required
                />
              </div>
            </GlassCard>
          </div>

          {/* Upload Drop Zone pane */}
          <div className="lg:col-span-2 flex flex-col space-y-6">
            <h2 className="text-lg font-black uppercase tracking-wider text-slate-400">Upload PDF resume</h2>
            
            <form onSubmit={handleUpload} className="space-y-6 flex-1 flex flex-col justify-between">
              <GlassCard className="flex-1 border-2 border-dashed border-white/10 hover:border-cyan-500/30 p-10 flex flex-col justify-center items-center text-center space-y-4 rounded-3xl min-h-[220px]">
                <FileUp className="w-16 h-16 text-slate-500 stroke-[1.2] animate-bounce" />
                <div>
                  <h4 className="text-sm font-bold text-white">Drag & Drop Resume PDF here</h4>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase mt-1">Accepts only .pdf formats up to 5MB</p>
                </div>
                
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="resume-file-picker"
                  required
                />
                <label
                  htmlFor="resume-file-picker"
                  className="px-5 py-2 bg-slate-900 border border-white/5 rounded-xl text-xs font-bold text-slate-300 cursor-pointer hover:bg-slate-800 transition-colors"
                >
                  Browse File
                </label>

                {file && (
                  <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 rounded-xl text-xs font-bold">
                    Selected File: {file.name}
                  </div>
                )}
              </GlassCard>

              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-semibold flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all border border-white/5"
              >
                Scan Resume ATS metrics
              </button>
            </form>
          </div>
          
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
