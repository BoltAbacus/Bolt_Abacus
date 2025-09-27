import { useState, useCallback, useRef } from 'react';
import { useAuthStore } from '@store/authStore';
import { updatePracticeProgressRequest } from '@services/student';

export interface PracticeProgress {
  currentQuestion: number;
  totalQuestions: number;
  progressPercentage: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracyPercentage: number;
  timeElapsed: number;
  isCompleted: boolean;
}

export interface PracticeProgressTrackerProps {
  operation: 'addition' | 'multiplication' | 'division';
  numberOfQuestions: number;
  numberOfDigits: number;
  numberOfRows: number;
  isZigzag: boolean;
  includeSubtraction: boolean;
  persistNumberOfDigits: boolean;
  audioMode: boolean;
  audioPace: string;
  showQuestion: boolean;
}

export const usePracticeProgress = (props: PracticeProgressTrackerProps) => {
  const authToken = useAuthStore((state) => state.authToken);
  
  const [progress, setProgress] = useState<PracticeProgress>({
    currentQuestion: 0,
    totalQuestions: props.numberOfQuestions,
    progressPercentage: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    accuracyPercentage: 0,
    timeElapsed: 0,
    isCompleted: false,
  });

  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const saveProgress = useCallback(async () => {
    if (!authToken) return;

    try {
      await updatePracticeProgressRequest(
        'flashcards',
        props.operation,
        progress.currentQuestion,
        progress.totalQuestions,
        progress.correctAnswers,
        progress.incorrectAnswers,
        progress.timeElapsed,
        progress.isCompleted,
        props.numberOfDigits,
        props.numberOfRows,
        props.isZigzag,
        props.includeSubtraction,
        props.persistNumberOfDigits,
        authToken
      );
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }, [authToken, progress, props]);

  const startTracking = useCallback(() => {
    setIsTracking(true);
    setStartTime(Date.now());
    setLastUpdateTime(Date.now());
    
    // Start timer
    intervalRef.current = setInterval(() => {
      const currentTime = Date.now();
      const elapsed = Math.floor((currentTime - startTime) / 1000);
      
      setProgress(prev => ({
        ...prev,
        timeElapsed: elapsed,
      }));
    }, 1000);
  }, [startTime]);

  const stopTracking = useCallback(() => {
    setIsTracking(false);
    setProgress(prev => ({ ...prev, isCompleted: true }));
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    saveProgress();
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('practiceSessionCompleted', {
      detail: {
        type: props.practiceType || 'flashcards',
        operation: props.operation,
        score: progress.correctAnswers,
        totalQuestions: progress.totalQuestions,
        timeElapsed: progress.timeElapsed
      }
    }));
  }, [saveProgress, progress, props]);

  const updateProgress = useCallback((isCorrect: boolean) => {
    const newProgress = {
      ...progress,
      currentQuestion: progress.currentQuestion + 1,
      correctAnswers: progress.correctAnswers + (isCorrect ? 1 : 0),
      incorrectAnswers: progress.incorrectAnswers + (isCorrect ? 0 : 1),
    };

    // Calculate percentages
    newProgress.progressPercentage = (newProgress.currentQuestion / newProgress.totalQuestions) * 100;
    newProgress.accuracyPercentage = (newProgress.correctAnswers / (newProgress.correctAnswers + newProgress.incorrectAnswers)) * 100;

    setProgress(newProgress);

    // Save progress immediately for important updates
    if (newProgress.currentQuestion % 5 === 0 || newProgress.currentQuestion === newProgress.totalQuestions) {
      saveProgress();
    }

    // Check if practice is completed
    if (newProgress.currentQuestion >= newProgress.totalQuestions) {
      stopTracking();
    }
  }, [progress, saveProgress, stopTracking]);

  const resetProgress = useCallback(() => {
    setProgress({
      currentQuestion: 0,
      totalQuestions: props.numberOfQuestions,
      progressPercentage: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      accuracyPercentage: 0,
      timeElapsed: 0,
      isCompleted: false,
    });
    setIsTracking(false);
    setStartTime(0);
    setLastUpdateTime(0);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [props.numberOfQuestions]);

  // Auto-save progress every 5 seconds
  const autoSave = useCallback(() => {
    if (isTracking && progress.currentQuestion > 0) {
      const currentTime = Date.now();
      if (currentTime - lastUpdateTime > 5000) {
        saveProgress();
        setLastUpdateTime(currentTime);
      }
    }
  }, [isTracking, progress.currentQuestion, lastUpdateTime, saveProgress]);

  // Set up auto-save interval
  useState(() => {
    const autoSaveInterval = setInterval(autoSave, 5000);
    return () => clearInterval(autoSaveInterval);
  });

  return {
    progress,
    isTracking,
    startTracking,
    stopTracking,
    updateProgress,
    resetProgress,
    saveProgress,
  };
};
