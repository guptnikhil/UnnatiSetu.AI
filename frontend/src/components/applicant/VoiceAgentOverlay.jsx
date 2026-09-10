import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Mic, Loader2, CheckCircle2, Sparkles, Volume2 } from 'lucide-react';
import { useAudioAnalyser } from '../../hooks/useAudioAnalyser';

export default function VoiceAgentOverlay({ isOpen, onClose, onTranscript, theme, t }) {
  const [state, setState] = useState('listening'); // 'listening' | 'processing' | 'result'
  const [stream, setStream] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const { getFrequencyData, getVolume } = useAudioAnalyser(stream);

  // Default Demo Voice Values (Single guaranteed value for demo presentation)
  const DEMO_TRANSCRIPT = "मैं सुनीता देवी, अनुसूचित जाति महिला किसान हूँ। मैं पटना ग्रामीण से हूँ और डेयरी उद्योग के लिए ₹1,20,000 ऋण चाहती हूँ।";
  
  const DEMO_EXTRACTED_PROFILE = {
    name: "Sunita Devi",
    category: "SC",
    gender: "Female",
    annual_income: 95000,
    locality: "Rural",
    state: "Bihar",
    district: "Patna",
    business_type: "Dairy/Agri",
    loan_amount_requested: 120000,
    affordability_monthly_emi: 2200
  };

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setState('listening');
    setElapsed(0);

    const initMic = async () => {
      try {
        if (navigator?.mediaDevices?.getUserMedia) {
          const s = await navigator.mediaDevices.getUserMedia({ audio: true });
          if (cancelled) {
            s.getTracks().forEach(track => track.stop());
            return;
          }
          const mime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
          const recorder = new MediaRecorder(s, { mimeType: mime });
          audioChunksRef.current = [];

          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
          };

          recorder.start(200);
          mediaRecorderRef.current = recorder;
          setStream(s);
        }
      } catch (err) {
        console.warn('[VoiceAgent] Mic fallback active for demo mode:', err);
      }
      startTimeRef.current = Date.now();
    };

    initMic();

    return () => {
      cancelled = true;
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try { mediaRecorderRef.current.stop(); } catch {}
      }
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [isOpen]);

  // Timer
  useEffect(() => {
    if (state !== 'listening') return;
    timerRef.current = setInterval(() => {
      const ms = Date.now() - (startTimeRef.current || Date.now());
      setElapsed(ms);
    }, 100);
    return () => clearInterval(timerRef.current);
  }, [state]);

  // Visualizer Animation
  useEffect(() => {
    if (state !== 'listening' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let running = true;

    const draw = () => {
      if (!running) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const baseRadius = Math.min(rect.width, rect.height) * 0.22;

      ctx.clearRect(0, 0, rect.width, rect.height);

      const freqData = getFrequencyData();
      const vol = getVolume();
      const pulse = vol * 25;
      const breathe = Math.sin(Date.now() * 0.005) * 5;
      const currentRadius = baseRadius + pulse + breathe;

      const isDark = theme !== 'light';

      // Waveform Bars
      if (freqData) {
        const barCount = 36;
        for (let i = 0; i < barCount; i++) {
          const angle = (i / barCount) * Math.PI * 2 - Math.PI / 2;
          const amp = freqData[i * 2] ? freqData[i * 2] / 255 : 0.15;
          const barLen = amp * baseRadius * 1.2;

          const x1 = cx + Math.cos(angle) * (currentRadius + 4);
          const y1 = cy + Math.sin(angle) * (currentRadius + 4);
          const x2 = cx + Math.cos(angle) * (currentRadius + 4 + barLen);
          const y2 = cy + Math.sin(angle) * (currentRadius + 4 + barLen);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = isDark ? `rgba(245, 158, 11, ${0.4 + amp * 0.6})` : `rgba(217, 119, 6, ${0.5 + amp * 0.5})`;
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
      }

      // Center Gradient Orb
      const grad = ctx.createRadialGradient(cx, cy, currentRadius * 0.1, cx, cy, currentRadius);
      grad.addColorStop(0, 'rgba(245, 158, 11, 0.95)');
      grad.addColorStop(0.7, 'rgba(234, 88, 12, 0.7)');
      grad.addColorStop(1, 'rgba(245, 158, 11, 0.1)');

      ctx.beginPath();
      ctx.arc(cx, cy, currentRadius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [state, theme, getFrequencyData, getVolume]);

  if (!isOpen) return null;

  const formatTime = (ms) => {
    const sec = Math.floor(ms / 1000);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isDark = theme !== 'light';

  // Process & Return Demo Result cleanly
  const handleCompleteVoice = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch {}
    }
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
    }
    setState('processing');

    setTimeout(() => {
      setState('result');
      setTimeout(() => {
        onTranscript(DEMO_TRANSCRIPT, DEMO_EXTRACTED_PROFILE);
        onClose();
      }, 600);
    }, 600);
  };

  const overlay = (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-between py-10 px-4 transition-all duration-300 ${
        isDark ? 'bg-slate-950/95 text-slate-100' : 'bg-white/95 text-slate-900'
      }`}
      style={{ backdropFilter: 'blur(20px)', animation: 'voice-backdrop-in 0.3s ease-out' }}
    >
      {/* Header */}
      <div className="w-full max-w-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Sarvam AI Voice Assistant</h3>
            <p className="text-[11px] text-slate-400 font-medium">Multilingual Spoken Profile Intake</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className={`p-2 rounded-xl transition-all cursor-pointer ${
            isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
          }`}
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Visualizer Body */}
      <div className="flex-1 flex flex-col items-center justify-center my-6 w-full max-w-md">
        
        {/* Status text */}
        <div className="mb-6 text-center">
          {state === 'listening' && (
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-bold animate-pulse">
              <Volume2 className="w-4 h-4 animate-bounce" />
              <span>Listening to Voice Input...</span>
            </div>
          )}
          {state === 'processing' && (
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sarvam AI Extracting Profile...</span>
            </div>
          )}
          {state === 'result' && (
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Profile Extracted Successfully!</span>
            </div>
          )}
        </div>

        {/* Canvas Visualizer */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          {state === 'listening' && (
            <canvas ref={canvasRef} className="w-full h-full cursor-pointer" onClick={handleCompleteVoice} />
          )}

          {state === 'processing' && (
            <div className="w-32 h-32 rounded-full border-4 border-amber-500 border-t-transparent animate-spin flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-amber-500" />
            </div>
          )}

          {state === 'result' && (
            <div className="w-36 h-36 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-bounce" />
            </div>
          )}
        </div>

        {/* Timer */}
        {state === 'listening' && (
          <span className="mt-4 text-2xl font-mono font-bold text-amber-500">
            {formatTime(elapsed)}
          </span>
        )}
      </div>

      {/* Transcript Preview & Action */}
      <div className="w-full max-w-lg space-y-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl text-center">
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block mb-1">
            Demo Voice Input Preview:
          </span>
          <p className="text-xs sm:text-sm text-slate-200 font-medium">
            "{DEMO_TRANSCRIPT}"
          </p>
        </div>

        <button
          onClick={handleCompleteVoice}
          disabled={state !== 'listening'}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 text-slate-950 font-extrabold text-sm hover:brightness-110 shadow-xl shadow-amber-500/25 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
        >
          <Mic className="w-5 h-5" />
          <span>Complete Voice Intake & Apply Profile</span>
        </button>
      </div>
    </div>
  );

  return ReactDOM.createPortal(overlay, document.body);
}
