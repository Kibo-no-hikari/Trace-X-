import { useState, useEffect, useCallback, useRef } from 'react';
import { DEMO_EVENTS, DEMO_CORRELATIONS } from '../data/demoEvents';

export function useDemoTimeline(autoAdvanceInterval = 3200) {
  // Step 0: Initial state (overview)
  // Step 1: Event 1 (02:03 - Failed logins)
  // Step 2: Event 2 (02:05 - Successful login)
  // Step 3: Event 3 (02:07 - File access)
  // Step 4: Event 4 (02:09 - 48 MB egress)
  // Step 5: Completed timeline reconstruction
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef(null);

  const totalSteps = DEMO_EVENTS.length; // 4 events

  const next = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev >= totalSteps) {
        setIsPlaying(false);
        return totalSteps;
      }
      return prev + 1;
    });
  }, [totalSteps]);

  const prev = useCallback(() => {
    setCurrentStep((p) => Math.max(1, p - 1));
  }, []);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(1);
  }, []);

  const play = useCallback(() => {
    if (currentStep >= totalSteps) {
      setCurrentStep(1);
    }
    setIsPlaying(true);
  }, [currentStep, totalSteps]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const jumpToStep = useCallback((step) => {
    setCurrentStep(Math.max(1, Math.min(step, totalSteps)));
  }, [totalSteps]);

  // Autoplay ticker
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= totalSteps) {
            setIsPlaying(false);
            return totalSteps;
          }
          return prev + 1;
        });
      }, autoAdvanceInterval);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, autoAdvanceInterval, totalSteps]);

  const activeEvent = DEMO_EVENTS[currentStep - 1] || DEMO_EVENTS[0];
  const visibleEvents = DEMO_EVENTS.slice(0, currentStep);
  const activeCorrelation = DEMO_CORRELATIONS[currentStep - 2] || null;

  return {
    currentStep,
    totalSteps,
    isPlaying,
    activeEvent,
    visibleEvents,
    activeCorrelation,
    play,
    pause,
    next,
    prev,
    reset,
    jumpToStep,
  };
}

export default useDemoTimeline;
