import React, { createContext, useContext, ReactNode } from 'react';
import { usePracticeProgress, PracticeProgress } from '@hooks/usePracticeProgress';

interface PracticeContextType {
  progress: PracticeProgress;
  isTracking: boolean;
  startTracking: () => void;
  stopTracking: () => void;
  updateProgress: (isCorrect: boolean) => void;
  resetProgress: () => void;
  saveProgress: () => void;
}

const PracticeContext = createContext<PracticeContextType | undefined>(undefined);

interface PracticeProviderProps {
  children: ReactNode;
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

export const PracticeProvider: React.FC<PracticeProviderProps> = ({
  children,
  operation,
  numberOfQuestions,
  numberOfDigits,
  numberOfRows,
  isZigzag,
  includeSubtraction,
  persistNumberOfDigits,
  audioMode,
  audioPace,
  showQuestion,
}) => {
  const practiceProgress = usePracticeProgress({
    operation,
    numberOfQuestions,
    numberOfDigits,
    numberOfRows,
    isZigzag,
    includeSubtraction,
    persistNumberOfDigits,
    audioMode,
    audioPace,
    showQuestion,
  });

  return (
    <PracticeContext.Provider value={practiceProgress}>
      {children}
    </PracticeContext.Provider>
  );
};

export const usePracticeContext = () => {
  const context = useContext(PracticeContext);
  if (context === undefined) {
    throw new Error('usePracticeContext must be used within a PracticeProvider');
  }
  return context;
};
