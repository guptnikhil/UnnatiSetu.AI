import { useRef, useState, useEffect, useCallback } from 'react';

export function useAudioAnalyser(stream) {
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const frequencyDataRef = useRef(null);
  const timeDomainDataRef = useRef(null);
  const [isSupported, setIsSupported] = useState(true);
  const [volume, setVolume] = useState(0);

  useEffect(() => {
    if (!stream) return;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      setIsSupported(false);
      return;
    }

    const ctx = new AudioCtx();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;

    const source = ctx.createMediaStreamSource(stream);
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const freqData = new Uint8Array(bufferLength);
    const timeData = new Uint8Array(bufferLength);

    audioContextRef.current = ctx;
    analyserRef.current = analyser;
    sourceRef.current = source;
    frequencyDataRef.current = freqData;
    timeDomainDataRef.current = timeData;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    return () => {
      source.disconnect();
      analyser.disconnect();
      ctx.close();
      audioContextRef.current = null;
      analyserRef.current = null;
      sourceRef.current = null;
      frequencyDataRef.current = null;
      timeDomainDataRef.current = null;
    };
  }, [stream]);

  const getFrequencyData = useCallback(() => {
    if (!analyserRef.current || !frequencyDataRef.current) return null;
    analyserRef.current.getByteFrequencyData(frequencyDataRef.current);
    return frequencyDataRef.current;
  }, []);

  const getVolume = useCallback(() => {
    if (!analyserRef.current || !timeDomainDataRef.current) return 0;
    analyserRef.current.getByteTimeDomainData(timeDomainDataRef.current);
    let sum = 0;
    for (let i = 0; i < timeDomainDataRef.current.length; i++) {
      const val = (timeDomainDataRef.current[i] - 128) / 128;
      sum += val * val;
    }
    const rms = Math.sqrt(sum / timeDomainDataRef.current.length);
    setVolume(rms);
    return rms;
  }, []);

  return { getFrequencyData, getVolume, volume, isSupported };
}
