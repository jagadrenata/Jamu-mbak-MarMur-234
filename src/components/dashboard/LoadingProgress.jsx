"use client";

import { useState, useEffect, useRef } from "react";

export default function LoadingJamu({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [slideUp, setSlideUp] = useState(false);
  const [hidden, setHidden] = useState(false);
  const progressRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    let stopped = false;
    let current = 0;

    const steps = [
      { target: 38, duration: 600 },
      { target: 65, duration: 800 },
      { target: 78, duration: 1200 },
      { target: 82, duration: 1800 },
    ];

    let stepIndex = 0;

    function runStep() {
      if (stopped || stepIndex >= steps.length) return;
      const { target, duration } = steps[stepIndex];
      const from = current;
      const start = performance.now();

      function animate(now) {
        if (stopped) return;
        const t = Math.min((now - start) / duration, 1);
        const eased = t * (2 - t);
        current = from + (target - from) * eased;
        progressRef.current = current;
        setProgress(Math.floor(current));

        if (t < 1) {
          rafRef.current = requestAnimationFrame(animate);
        } else {
          stepIndex++;
          rafRef.current = requestAnimationFrame(runStep);
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    }

    runStep();

    return () => {
      stopped = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    if (typeof onComplete !== "boolean" || !onComplete) return;

    let stopped = false;
    const from = progressRef.current;
    const start = performance.now();
    const duration = 700;

    function animate(now) {
      if (stopped) return;
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = from + (100 - from) * eased;
      progressRef.current = val;
      setProgress(Math.floor(val));

      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setTimeout(() => setSlideUp(true), 200);
        setTimeout(() => setHidden(true), 1400);
      }
    }

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      stopped = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [onComplete]);

  if (hidden) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-cream-100 flex flex-col items-center justify-center transition-transform duration-[1300ms] [transition-timing-function:cubic-bezier(0.7,0,0.3,1)] ${
        slideUp ? "-translate-y-full" : ""
      }`}
    >
      <div className="font-serif text-md font-light tracking-[0.1em] leading-none text-black select-none">
        234
      </div>

      <div className="w-[90px] mt-2">

        <div className="h-[3px] bg-cream-300 rounded-full overflow-hidden">
          <div
            className="h-full bg-cream-500 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

      </div>
    </div>
  );
}