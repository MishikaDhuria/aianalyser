import React, { useState, useEffect, useRef } from 'react';
import { Camera, CameraOff, Brain, ShieldAlert } from 'lucide-react';

const WebcamMonitor = ({ onEmotionUpdate }) => {
  const [isActive, setIsActive] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);
  const [emotions, setEmotions] = useState({
    confidence: 80,
    focus: 85,
    calmness: 90,
    stress: 10
  });

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Initialize emotion fluctuations to simulate live scanning AI engine
  useEffect(() => {
    let interval;
    if (isActive) {
      interval = setInterval(() => {
        const nextEmotions = {
          confidence: Math.round(75 + Math.random() * 15),
          focus: Math.round(80 + Math.random() * 15),
          calmness: Math.round(82 + Math.random() * 12),
          stress: Math.round(8 + Math.random() * 12)
        };
        setEmotions(nextEmotions);
        if (onEmotionUpdate) {
          onEmotionUpdate(nextEmotions);
        }
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isActive, onEmotionUpdate]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsActive(true);
        setHasPermission(true);
      }
    } catch (err) {
      console.error('Microphone or Camera access refused:', err);
      setHasPermission(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  };

  useEffect(() => {
    // Start camera immediately on load for user ease
    startCamera();
    return () => stopCamera();
  }, []);

  return (
    <div className="w-full bg-slate-900/60 rounded-3xl border border-white/5 overflow-hidden flex flex-col relative shadow-2xl">
      {/* Video Stream Container */}
      <div className="w-full aspect-video bg-slate-950 relative flex items-center justify-center">
        {isActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1] rounded-t-3xl"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-500 space-y-2">
            <CameraOff className="w-12 h-12 text-slate-600 stroke-[1.5]" />
            <p className="text-sm font-semibold">Webcam Feed Inactive</p>
          </div>
        )}

        {!hasPermission && (
          <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center space-y-2 z-20">
            <ShieldAlert className="w-10 h-10 text-rose-500" />
            <h4 className="text-sm font-bold text-slate-200">Camera Access Blocked</h4>
            <p className="text-xs text-slate-500 max-w-xs">
              Please grant camera permissions in your browser to enable live posture and emotion tracking features.
            </p>
          </div>
        )}

        {/* Live scanning overlay indicators */}
        {isActive && (
          <>
            <div className="absolute top-4 left-4 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center space-x-1 uppercase tracking-wider animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>AI Face-Scan Active</span>
            </div>

            {/* Simulated green boundary crop box */}
            <div className="absolute inset-[15%] border-2 border-dashed border-cyan-400/35 rounded-2xl pointer-events-none flex items-center justify-center">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-cyan-400 -mt-1 -ml-1" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-cyan-400 -mt-1 -mr-1" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-cyan-400 -mb-1 -ml-1" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-cyan-400 -mb-1 -mr-1" />
              <div className="w-full h-[2px] bg-cyan-400/25 absolute top-1/2 left-0 transform -translate-y-1/2 animate-[pulse_1s_infinite]" />
            </div>
          </>
        )}
      </div>

      {/* Control buttons & Emotion metrics grid */}
      <div className="p-4 bg-slate-950/80 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-white/5">
        <button
          onClick={isActive ? stopCamera : startCamera}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
            isActive
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30'
              : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30'
          }`}
        >
          {isActive ? (
            <>
              <CameraOff className="w-4 h-4" />
              <span>Disable Feed</span>
            </>
          ) : (
            <>
              <Camera className="w-4 h-4" />
              <span>Enable Feed</span>
            </>
          )}
        </button>

        {/* Emotion diagnostics grid */}
        <div className="grid grid-cols-4 gap-3 bg-slate-900/60 p-2 rounded-2xl border border-white/5 w-full md:w-auto">
          {Object.entries(emotions).map(([name, score]) => (
            <div key={name} className="flex flex-col items-center px-3 py-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                {name}
              </span>
              <span
                className={`text-sm font-black ${
                  name === 'stress'
                    ? score > 20
                      ? 'text-rose-400'
                      : 'text-emerald-400'
                    : 'text-cyan-300'
                }`}
              >
                {score}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WebcamMonitor;
