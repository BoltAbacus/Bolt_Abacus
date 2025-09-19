import { useState, useRef, useCallback } from 'react';

export interface ProblemTime {
  questionId: string;
  startTime: number;
  endTime: number;
  timeSpent: number; // in seconds
  isCorrect: boolean;
  isSkipped: boolean;
}

export interface UseProblemTimerReturn {
  startProblem: (questionId: string) => void;
  endProblem: (questionId: string, isCorrect: boolean, isSkipped?: boolean) => ProblemTime | null;
  getCurrentProblemTime: () => number;
  getProblemTimes: () => ProblemTime[];
  resetTimer: () => void;
}

export const useProblemTimer = (): UseProblemTimerReturn => {
  const [problemTimes, setProblemTimes] = useState<ProblemTime[]>([]);
  const currentProblemRef = useRef<{ questionId: string; startTime: number } | null>(null);

  const startProblem = useCallback((questionId: string) => {
    const startTime = Date.now();
    currentProblemRef.current = { questionId, startTime };
  }, []);

  const endProblem = useCallback((questionId: string, isCorrect: boolean, isSkipped = false): ProblemTime | null => {
    if (!currentProblemRef.current || currentProblemRef.current.questionId !== questionId) {
      return null;
    }

    const endTime = Date.now();
    const timeSpent = (endTime - currentProblemRef.current.startTime) / 1000; // Convert to seconds

    const problemTime: ProblemTime = {
      questionId,
      startTime: currentProblemRef.current.startTime,
      endTime,
      timeSpent,
      isCorrect,
      isSkipped,
    };

    setProblemTimes(prev => [...prev, problemTime]);
    currentProblemRef.current = null;

    return problemTime;
  }, []);

  const getCurrentProblemTime = useCallback((): number => {
    if (!currentProblemRef.current) {
      return 0;
    }
    return (Date.now() - currentProblemRef.current.startTime) / 1000;
  }, []);

  const getProblemTimes = useCallback((): ProblemTime[] => {
    return problemTimes;
  }, [problemTimes]);

  const resetTimer = useCallback(() => {
    setProblemTimes([]);
    currentProblemRef.current = null;
  }, []);

  return {
    startProblem,
    endProblem,
    getCurrentProblemTime,
    getProblemTimes,
    resetTimer,
  };
};
