import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { X, Mic, Loader2, CheckCircle2 } from 'lucide-react';
import { useAudioAnalyser } from '../../hooks/useAudioAnalyser';
import { speechToText } from '../../services/sarvam';

const SILENCE_THRESHOLD = 0.05;
const SILENCE_AUTO_STOP_MS = 2000;
const MIN_RECORDING_MS = 1500;
const MAX_RECORDING_MS = 120000;

export default function VoiceAgentOverlay({ isOpen, onClose, onTranscript, theme, t }) {
  const [state, setState] = useState('entering');
  const [stream, setStream] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [displayedTranscript, setDisplayedTranscript] = useState('');
  const [silenceCountdown, setSilenceCountdown] = useState(0);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const timerRef = useRef(null);
  const silenceStartRef = useRef(null);
  const startTimeRef = useRef(null);
  const mimeTypeRef = useRef('audio/webm');

  const { getFrequencyData, getVolume, isSupported } = useAudioAnalyser(stream);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setState('processing');
  }, [stream]);

  // Start recording when overlay opens
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    const init = async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) {
          s.getTracks().forEach(t => t.stop());
          return;
        }

        const mime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
        mimeTypeRef.current = mime;
        const recorder = new MediaRecorder(s, { mimeType: mime });
        audioChunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        recorder.onstop = async () => {
          s.getTracks().forEach(t => t.stop());
          const blob = new Blob(audioChunksRef.current, { type: mime });

          const result = await speechToText(blob, mime);
          if (result.success && result.transcript) {
            setTranscript(result.transcript);
            setState('result');
          } else {
            setError(t.voiceNoSpeech || 'No speech detected');
            setState('result');
          }
        };

        recorder.start();
        mediaRecorderRef.current = recorder;
        setStream(s);
        setState('listening');
        startTimeRef.current = Date.now();
      } catch (err) {
        setError('Microphone access denied');
        setState('result');
      }
    };

    setState('entering');
    setTranscript('');
    setDisplayedTranscript('');
    setElapsed(0);
    setSilenceCountdown(0);
    setError(null);
    init();

    return () => {
      cancelled = true;
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isOpen]);

  // Timer
  useEffect(() => {
    if (state !== 'listening') return;
    timerRef.current = setInterval(() => {
      const ms = Date.now() - startTimeRef.current;
      setElapsed(ms);
      if (ms >= MAX_RECORDING_MS) stopRecording();
    }, 100);
    return () => clearInterval(timerRef.current);
  }, [state, stopRecording]);

  // Canvas rendering + silence detection
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
      const baseRadius = Math.min(rect.width, rect.height) * 0.18;

      ctx.clearRect(0, 0, rect.width, rect.height);

      const freqData = getFrequencyData();
      const vol = getVolume();

      // Silence detection
      if (vol < SILENCE_THRESHOLD) {
        if (!silenceStartRef.current) silenceStartRef.current = Date.now();
        const silenceDur = Date.now() - silenceStartRef.current;
        const countdown = Math.max(0, Math.ceil((SILENCE_AUTO_STOP_MS - silenceDur) / 1000));
        setSilenceCountdown(countdown);
        if (silenceDur >= SILENCE_AUTO_STOP_MS && (Date.now() - startTimeRef.current) > MIN_RECORDING_MS) {
          stopRecording();
          return;
        }
      } else {
        silenceStartRef.current = null;
        setSilenceCountdown(0);
      }

      const isDark = theme !== 'light';
      const orbColor = isDark ? 'rgba(245, 158, 11, 0.9)' : 'rgba(217, 119, 6, 0.9)';
      const barColor = isDark ? 'rgba(251, 191, 36,' : 'rgba(245, 158, 11,';
      const pulseOffset = vol * 15;
      const breathe = Math.sin(Date.now() * 0.003) * 5;
      const currentRadius = baseRadius + pulseOffset + breathe;

      // Frequency bars radiating outward
      if (freqData) {
        const barCount = freqData.length;
        const maxBarLen = baseRadius * 1.2;
        for (let i = 0; i < barCount; i++) {
          const angle = (i / barCount) * Math.PI * 2 - Math.PI / 2;
          const amplitude = freqData[i] / 255;
          const barLen = amplitude * maxBarLen;
          if (barLen < 2) continue;

          const x1 = cx + Math.cos(angle) * (currentRadius + 4);
          const y1 = cy + Math.sin(angle) * (currentRadius + 4);
          const x2 = cx + Math.cos(angle) * (currentRadius + 4 + barLen);
          const y2 = cy + Math.sin(angle) * (currentRadius + 4 + barLen);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = `${barColor}${0.3 + amplitude * 0.7})`;
          ctx.lineWidth = 2.5;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
      }

      // Orb glow
      const gradient = ctx.createRadialGradient(cx, cy, currentRadius * 0.2, cx, cy, currentRadius);
      gradient.addColorStop(0, orbColor);
      gradient.addColorStop(1, isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(217, 119, 6, 0.1)');
      ctx.beginPath();
      ctx.arc(cx, cy, currentRadius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Inner bright core
      ctx.beginPath();
      ctx.arc(cx, cy, currentRadius * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.25)';
      ctx.fill();

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [state, theme, getFrequencyData, getVolume, stopRecording]);

  // Typing effect for transcript
  useEffect(() => {
    if (state !== 'result' || !transcript) return;
    let i = 0;
    setDisplayedTranscript('');
    const interval = setInterval(() => {
      setDisplayedTranscript(transcript.slice(0, ++i));
      if (i >= transcript.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [state, transcript]);

  // Auto-close after result display
  useEffect(() => {
    if (state === 'result' && transcript) {
      const typingDuration = transcript.length * 30;
      const timeout = setTimeout(() => {
        onTranscript(transcript);
        onClose();
      }, typingDuration + 1200);
      return () => clearTimeout(timeout);
    }
    if (state === 'result' && error) {
      const timeout = setTimeout(() => onClose(), 2000);
      return () => clearTimeout(timeout);
    }
  }, [state, transcript, error, onTranscript, onClose]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(timerRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const formatTime = (ms) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const stateLabel = {
    entering: '',
    listening: t.voiceListening || 'Listening...',
    processing: t.voiceProcessing || 'Processing...',
    result: error ? error : (t.voiceProfileUpdated || 'Done!'),
  }[state];

  const isDark = theme !== 'light';

  const overlay = (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-all duration-500 ${
        isDark ? 'bg-slate-950/95' : 'bg-white/95'
      }`}
      style={{ backdropFilter: 'blur(20px)', animation: 'voice-backdrop-in 0.4s ease-out' }}
      onClick={() => state === 'listening' && stopRecording()}
    >
      {/* Close button */}
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className={`absolute top-6 right-6 p-2 rounded-full transition-colors ${
          isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <X className="w-6 h-6" />
      </button>

      {/* State label */}
      <div className={`mb-8 text-lg font-semibold tracking-wide transition-opacity duration-300 ${
        isDark ? 'text-slate-200' : 'text-slate-700'
      }`}>
        {state === 'processing' && <Loader2 className="w-5 h-5 inline animate-spin mr-2 text-amber-500" />}
        {state === 'result' && !error && <CheckCircle2 className="w-5 h-5 inline mr-2 text-emerald-500" />}
        {stateLabel}
      </div>

      {/* Orb visualization area */}
      {(state === 'listening' || state === 'entering') && (
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
          {/* CSS ring animations (fallback + enhancement) */}
          <div className={`absolute inset-0 rounded-full voice-orb-ring ${
            isDark ? 'border-2 border-amber-500/30' : 'border-2 border-amber-400/30'
          }`} />
          <div className={`absolute inset-0 rounded-full voice-orb-ring-2 ${
            isDark ? 'border-2 border-amber-500/20' : 'border-2 border-amber-400/20'
          }`} />

          {/* Canvas for real-time frequency viz */}
          {isSupported ? (
            <canvas ref={canvasRef} className="w-full h-full" />
          ) : (
            <div className={`w-32 h-32 rounded-full voice-orb-glow ${
              isDark ? 'bg-amber-500' : 'bg-amber-400'
            }`} style={{ animation: 'voice-orb-breathe 2s ease-in-out infinite' }} />
          )}
        </div>
      )}

      {/* Processing spinner */}
      {state === 'processing' && (
        <div className="w-24 h-24 flex items-center justify-center">
          <Loader2 className={`w-16 h-16 animate-spin ${isDark ? 'text-amber-500' : 'text-amber-600'}`} />
        </div>
      )}

      {/* Timer */}
      {state === 'listening' && (
        <div className={`mt-6 text-3xl font-mono font-light tabular-nums ${
          isDark ? 'text-slate-300' : 'text-slate-600'
        }`}>
          {formatTime(elapsed)}
        </div>
      )}

      {/* Silence countdown */}
      {silenceCountdown > 0 && state === 'listening' && (
        <div className={`mt-3 text-sm font-medium ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
          {t.voiceAutoStopping || 'Auto-stopping in'} {silenceCountdown}s
        </div>
      )}

      {/* Transcript display */}
      {state === 'result' && (
        <div className={`max-w-lg mx-auto px-8 text-center text-lg leading-relaxed min-h-[3rem] ${
          isDark ? 'text-slate-200' : 'text-slate-800'
        }`}>
          {error ? (
            <span className="text-red-400">{error}</span>
          ) : (
            <>
              "{displayedTranscript}"
              {displayedTranscript.length < transcript.length && (
                <span className="inline-block w-0.5 h-5 ml-0.5 align-middle bg-amber-500 animate-pulse" />
              )}
            </>
          )}
        </div>
      )}

      {/* Tap to stop hint */}
      {state === 'listening' && (
        <div className={`mt-8 text-xs font-medium uppercase tracking-widest opacity-50 ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}>
          {t.voiceTapToStop || 'Tap anywhere to stop'}
        </div>
      )}
    </div>
  );

  return ReactDOM.createPortal(overlay, document.body);
}
