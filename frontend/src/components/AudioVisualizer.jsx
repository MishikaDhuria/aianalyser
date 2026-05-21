import React, { useEffect, useRef } from 'react';

const AudioVisualizer = ({ isRecording }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let phase = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isRecording) {
        phase += 0.15;
        // Draw 3 layers of waves with different opacities and speeds
        drawWave(ctx, canvas.width, canvas.height, phase, 'rgba(6, 182, 212, 0.45)', 4, 30);
        drawWave(ctx, canvas.width, canvas.height, phase * 0.7, 'rgba(139, 92, 246, 0.35)', 6, 20);
        drawWave(ctx, canvas.width, canvas.height, phase * 1.3, 'rgba(236, 72, 153, 0.25)', 8, 15);
      } else {
        // Flatline wave
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording]);

  const drawWave = (ctx, width, height, phase, color, frequency, amplitude) => {
    ctx.beginPath();
    ctx.moveTo(0, height / 2);

    for (let x = 0; x < width; x++) {
      const angle = (x / width) * Math.PI * frequency + phase;
      const y = height / 2 + Math.sin(angle) * amplitude;
      ctx.lineTo(x, y);
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  };

  return (
    <div className="w-full flex justify-center py-4 bg-slate-950/45 rounded-xl border border-white/5 glow-cyan">
      <canvas
        ref={canvasRef}
        width="400"
        height="100"
        className="w-full max-w-md block bg-transparent"
      />
    </div>
  );
};

export default AudioVisualizer;
