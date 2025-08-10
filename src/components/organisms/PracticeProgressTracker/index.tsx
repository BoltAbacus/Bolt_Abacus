import { FC, useEffect } from 'react';
import { usePracticeContext } from '../../../contexts/PracticeContext';
import { PracticeProgress } from '../../../hooks/usePracticeProgress';

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
  onProgressUpdate?: (progress: PracticeProgress) => void;
}



const PracticeProgressTracker: FC<PracticeProgressTrackerProps> = ({
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
  onProgressUpdate,
}) => {
  const {
    progress,
    isTracking,
    startTracking,
    stopTracking,
    updateProgress,
    resetProgress,
  } = usePracticeContext();

  // Notify parent component when progress changes
  useEffect(() => {
    if (onProgressUpdate) {
      onProgressUpdate(progress);
    }
  }, [progress, onProgressUpdate]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-black/80 backdrop-blur-xl p-6 rounded-2xl border border-gold/50 shadow-2xl">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gold mb-2">📊 Real-Time Progress</h3>
        <p className="text-white/80 text-sm">Your progress is automatically saved!</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white font-semibold">Progress</span>
          <span className="text-gold font-bold">
            {progress.currentQuestion} / {progress.totalQuestions}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-gold to-lightGold h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress.progressPercentage}%` }}
          />
        </div>
        <div className="text-center mt-1">
          <span className="text-gold font-bold text-lg">
            {progress.progressPercentage.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Accuracy */}
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-gold/30">
          <div className="text-center">
            <div className="text-2xl font-bold text-green mb-1">
              {progress.accuracyPercentage.toFixed(1)}%
            </div>
            <div className="text-white/80 text-sm">Accuracy</div>
            <div className="text-xs text-white/60 mt-1">
              {progress.correctAnswers} correct, {progress.incorrectAnswers} incorrect
            </div>
          </div>
        </div>

        {/* Time */}
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-gold/30">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue mb-1">
              {formatTime(progress.timeElapsed)}
            </div>
            <div className="text-white/80 text-sm">Time Elapsed</div>
            <div className="text-xs text-white/60 mt-1">
              {progress.currentQuestion > 0 
                ? `${(progress.timeElapsed / progress.currentQuestion).toFixed(1)}s avg`
                : 'Not started'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="text-center mb-4">
        <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${
          !isTracking && progress.currentQuestion === 0
            ? 'bg-gray-600 text-white'
            : isTracking
            ? 'bg-green-600 text-white'
            : 'bg-gold text-black'
        }`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${
            !isTracking && progress.currentQuestion === 0
              ? 'bg-gray-400'
              : isTracking
              ? 'bg-white animate-pulse'
              : 'bg-black'
          }`} />
          {!isTracking && progress.currentQuestion === 0
            ? 'Ready to Start'
            : isTracking
            ? 'Live Tracking'
            : 'Completed'
          }
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-3">
        {!isTracking && progress.currentQuestion === 0 && (
          <button
            onClick={startTracking}
            className="flex-1 bg-gradient-to-r from-green to-lightGreen text-black font-bold py-3 px-4 rounded-xl hover:from-green/90 hover:to-lightGreen/90 transition-all duration-300"
          >
            🚀 Start Tracking
          </button>
        )}
        
        {isTracking && (
          <button
            onClick={stopTracking}
            className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold py-3 px-4 rounded-xl hover:from-red-500/90 hover:to-pink-500/90 transition-all duration-300"
          >
            ⏹️ Stop Tracking
          </button>
        )}
        
        {progress.currentQuestion > 0 && (
          <button
            onClick={resetProgress}
            className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold py-3 px-4 rounded-xl hover:from-gray-600/90 hover:to-gray-700/90 transition-all duration-300"
          >
            🔄 Reset
          </button>
        )}
      </div>

      {/* Auto-save indicator */}
      <div className="text-center mt-4">
        <div className="text-xs text-white/60">
          {isTracking ? '🔄 Auto-saving every 5 seconds' : '💾 Progress saved'}
        </div>
      </div>
    </div>
  );
};

export default PracticeProgressTracker;
