"use client";

import { useState, useEffect, useRef } from "react";

const BARS = 28;

export default function LoadingProgress({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [slideUp, setSlideUp] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [tick, setTick] = useState(0);
  const progressRef = useRef(0);
  const animFrameRef = useRef(null);
  const tickIntervalRef = useRef(null);

  // Waveform tick
  useEffect(() => {
    tickIntervalRef.current = setInterval(() => setTick(t => t + 1), 80);
    return () => clearInterval(tickIntervalRef.current);
  }, []);

  // Progress: naik cepat ke ~75, lalu berhenti nunggu onComplete
  useEffect(() => {
    let current = 0;
    let stopped = false;

    const FAKE_STEPS = [
      { target: 22, duration: 350 },
      { target: 45, duration: 300 },
      { target: 63, duration: 280 },
      { target: 72, duration: 400 },
      { target: 76, duration: 900 }, // mulai melambat
      { target: 79, duration: 1400 }
      // berhenti di 79 nunggu fetch selesai
    ];

    let stepIndex = 0;

    function animateStep() {
      if (stopped || stepIndex >= FAKE_STEPS.length) return;
      const step = FAKE_STEPS[stepIndex];
      const from = current;
      const to = step.target;
      const dur = step.duration;
      const startTime = performance.now();

      function tick(now) {
        if (stopped) return;
        const elapsed = now - startTime;
        const t = Math.min(elapsed / dur, 1);
        const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        const val = from + (to - from) * eased;
        current = val;
        progressRef.current = val;
        setProgress(Math.round(val));

        if (t < 1) {
          animFrameRef.current = requestAnimationFrame(tick);
        } else {
          stepIndex++;
          animFrameRef.current = requestAnimationFrame(animateStep);
        }
      }

      animFrameRef.current = requestAnimationFrame(tick);
    }

    animateStep();

    return () => {
      stopped = true;
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Saat onComplete dipanggil (fetch selesai), lanjutkan ke 100 lalu slide up
  useEffect(() => {
    if (!onComplete) return;

    let stopped = false;
    const from = progressRef.current;
    const to = 100;
    const dur = 600;
    const startTime = performance.now();

    function tick(now) {
      if (stopped) return;
      const elapsed = now - startTime;
      const t = Math.min(elapsed / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = from + (to - from) * eased;
      progressRef.current = val;
      setProgress(Math.round(val));

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        setTimeout(() => setSlideUp(true), 300);
        setTimeout(() => setHidden(true), 1600);
      }
    }

    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      stopped = true;
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [onComplete]);

  if (hidden) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Share+Tech+Mono&display=swap');

        .loader-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          transform: translateY(0);
          transition: transform 1.2s cubic-bezier(0.76, 0, 0.24, 1);
          will-change: transform;
          overflow: hidden;
        }
        .loader-overlay.slide-up {
          transform: translateY(-100%);
        }
        .lb-bg {
          position: absolute; inset: 0;
          background:
            linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.65) 55%, rgba(0,0,0,0.97) 100%),
            url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&q=80') center/cover no-repeat;
          filter: saturate(0.35) brightness(0.65);
        }
        .lb-grain {
          position: absolute; inset: 0; opacity: 0.055;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px;
        }
        .lb-vignette {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at center, transparent 38%, rgba(0,0,0,0.82) 100%);
        }
        .lb-content {
          position: relative; z-index: 2;
          height: 100vh;
          display: flex; flex-direction: column;
          justify-content: flex-end;
          padding: 40px 48px;
        }
        .lb-freq {
          position: absolute; top: 40px; right: 48px; text-align: right;
        }
        .lb-freq-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.4rem; color: rgba(201,176,110,0.55);
          letter-spacing: 0.1em;
        }
        .lb-freq-label {
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.5rem; color: rgba(201,176,110,0.3);
          letter-spacing: 0.3em;
        }
        .lb-tag {
          font-family: 'Share Tech Mono', monospace;
          color: #c9b06e; font-size: 0.62rem;
          letter-spacing: 0.35em; text-transform: uppercase;
          margin-bottom: 4px; opacity: 0.65;
        }
        .lb-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(3rem, 8vw, 5.5rem);
          color: #fff; line-height: 0.9;
          letter-spacing: 0.05em; margin-bottom: 28px;
          text-shadow: 0 0 60px rgba(201,176,110,0.25);
        }
        .lb-card {
          border: 1px solid rgba(201,176,110,0.22);
          background: rgba(0,0,0,0.52);
          backdrop-filter: blur(14px);
          padding: 20px 24px;
          max-width: 520px;
          position: relative;
        }
        .lb-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, #c9b06e, transparent);
        }
        .lb-card-header {
          display: flex; justify-content: space-between;
          align-items: center; margin-bottom: 14px;
        }
        .lb-label {
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.58rem; letter-spacing: 0.28em;
          color: #c9b06e; opacity: 0.6;
        }
        .lb-blink {
          width: 6px; height: 6px; border-radius: 50%;
          background: #c9b06e;
          animation: lbBlink 1s step-end infinite;
        }
        @keyframes lbBlink { 0%,100%{opacity:1} 50%{opacity:0} }
        .lb-wave {
          display: flex; align-items: center;
          gap: 2px; height: 30px; margin-bottom: 14px;
        }
        .lb-wave-bar {
          flex: 1; border-radius: 1px;
          transition: height 0.08s ease;
        }
        .lb-progress-row {
          display: flex; justify-content: space-between;
          align-items: baseline; margin-bottom: 8px;
        }
        .lb-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2.6rem; color: #fff;
          line-height: 1; letter-spacing: 0.05em;
        }
        .lb-status {
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.58rem; color: #c9b06e;
          letter-spacing: 0.22em; opacity: 0.7;
        }
        .lb-track {
          width: 100%; height: 2px;
          background: rgba(255,255,255,0.07);
          position: relative; overflow: hidden;
        }
        .lb-fill {
          height: 100%;
          background: linear-gradient(90deg, #7a5c22, #c9b06e, #e8d5a0);
          transition: width 0.1s linear;
          position: relative;
        }
        .lb-fill::after {
          content: '';
          position: absolute; right: 0; top: -2px;
          width: 4px; height: 6px;
          background: #fff; border-radius: 1px;
          box-shadow: 0 0 8px #c9b06e;
        }
        .lb-bottom {
          display: flex; justify-content: space-between;
          margin-top: 8px; opacity: 0.45;
        }
        .lb-bottom-text {
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.52rem; letter-spacing: 0.18em; color: #c9b06e;
        }
        .lb-corner {
          position: absolute;
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.48rem; color: rgba(201,176,110,0.38);
          letter-spacing: 0.15em;
        }
        .lb-corner.tl { top: 14px; left: 14px; }
        .lb-corner.tr { top: 14px; right: 14px; }
      `}</style>

      <div className={`loader-overlay${slideUp ? " slide-up" : ""}`}>
        <div className='lb-bg' />
        <div className='lb-grain' />
        <div className='lb-vignette' />

        <div className='lb-content'>
          <div className='lb-freq'>
            <div className='lb-freq-num'>ADMIN</div>
            <div className='lb-freq-label'>DASHBOARD · v2</div>
          </div>

          <div className='lb-tag'>Authenticating Session</div>
          <div className='lb-title'>
            ADMIN
            <br />
            PANEL
          </div>

          <div className='lb-card'>
            <span className='lb-corner tl'>SYS-01</span>
            <span className='lb-corner tr'>LIVE</span>

            <div className='lb-card-header'>
              <span className='lb-label'>◈ VERIFYING ADMIN ACCESS</span>
              <div className='lb-blink' />
            </div>

            <div className='lb-wave'>
              {Array.from({ length: BARS }).map((_, i) => {
                const isActive = (i / BARS) * 100 < progress;
                const seed = Math.sin(i * 7.3 + tick * 0.8) * 0.5 + 0.5;
                const height = isActive
                  ? `${7 + seed * 20}px`
                  : `${2 + Math.sin(i * 2.1) * 2}px`;
                return (
                  <div
                    key={i}
                    className='lb-wave-bar'
                    style={{
                      height,
                      background: isActive
                        ? `rgba(201,${120 + seed * 56},${40 + seed * 30},${0.55 + seed * 0.45})`
                        : "rgba(255,255,255,0.07)"
                    }}
                  />
                );
              })}
            </div>

            <div className='lb-progress-row'>
              <span className='lb-num'>
                {String(progress).padStart(3, "0")}
              </span>
              <span className='lb-status'>
                {progress < 70
                  ? "FAST SYNC"
                  : progress < 90
                    ? "AWAITING AUTH..."
                    : progress < 100
                      ? "FINALIZING"
                      : "✓ ACCESS GRANTED"}
              </span>
            </div>

            <div className='lb-track'>
              <div className='lb-fill' style={{ width: `${progress}%` }} />
            </div>

            <div className='lb-bottom'>
              <span className='lb-bottom-text'>SIG ████░░ 74dB</span>
              <span className='lb-bottom-text'>
                {progress}% · {100 - progress} REMAINING
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}