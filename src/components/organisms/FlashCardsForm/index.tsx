import { Dispatch, FC, SetStateAction, useState } from 'react';
import swal from 'sweetalert';

import Button from '@components/atoms/Button';
import PracticeProgressTracker from '@components/organisms/PracticeProgressTracker';
import FlashCardPractice from '@components/organisms/FlashCardPractice';
import { PracticeProvider } from '../../../contexts/PracticeContext';
import { PracticeProgress } from '../../../hooks/usePracticeProgress';

export interface FlashCardsFormProps {
  operation: 'addition' | 'multiplication' | 'division';
  numberOfQuestions: number;
  setNumberOfQuestions: Dispatch<SetStateAction<number>>;
  numberOfDigits: number;
  setNumberOfDigits: Dispatch<SetStateAction<number>>;
  isZigzag: boolean;
  setIsZigzag: Dispatch<SetStateAction<boolean>>;
  speed: number;
  setSpeed: Dispatch<SetStateAction<number>>;
  numberOfRows: number;
  setNumberOfRows: Dispatch<SetStateAction<number>>;
  includeSubtraction: boolean;
  setIncludeSubtraction: Dispatch<SetStateAction<boolean>>;
  persistNumberOfDigits: boolean;
  setPersistNumberOfDigits: Dispatch<SetStateAction<boolean>>;
  audioMode: boolean;
  setAudioMode: Dispatch<SetStateAction<boolean>>;
  audioPace: string;
  setAudioPace: Dispatch<SetStateAction<string>>;
  showQuestion: boolean;
  setShowQuestion: Dispatch<SetStateAction<boolean>>;
  handleStartQuiz: () => void;
}

const FlashCardsForm: FC<FlashCardsFormProps> = ({
  operation,
  numberOfDigits,
  isZigzag,
  numberOfQuestions,
  speed,
  numberOfRows,
  includeSubtraction,
  persistNumberOfDigits,
  audioMode,
  audioPace,
  showQuestion,
  setNumberOfQuestions,
  setNumberOfDigits,
  setIsZigzag,
  setSpeed,
  setNumberOfRows,
  setIncludeSubtraction,
  setPersistNumberOfDigits,
  setAudioMode,
  setAudioPace,
  setShowQuestion,
  handleStartQuiz,
}) => {
  const [showProgressTracker, setShowProgressTracker] = useState(false);
  const [showPractice, setShowPractice] = useState(false);
  const [currentProgress, setCurrentProgress] = useState<PracticeProgress | null>(null);
  const verifyAndStartQuiz = () => {
    if (
      !numberOfQuestions ||
      numberOfQuestions <= 0 ||
      numberOfQuestions > 1000
    ) {
      swal({
        title: 'Invalid number of questions',
        text: 'Please enter between 1 and 1000 questions',
        icon: 'error',
      });
      return;
    }

    if (!numberOfDigits || numberOfDigits <= 0 || numberOfDigits > 15) {
      swal({
        title: 'Invalid number of digits',
        text: 'Please enter between 1 and 15 digits',
        icon: 'error',
      });
      return;
    }

    if (!numberOfRows || numberOfRows <= 0 || numberOfRows > 15) {
      swal({
        title: 'Invalid number of rows',
        text: 'Please enter between 1 and 15 digits',
        icon: 'error',
      });
      return;
    }

    if (!speed || speed <= 100 || speed > 5000) {
      swal({
        title: 'Invalid speed',
        text: 'Please enter between 100 and 5000 ms',
        icon: 'error',
      });
      return;
    }
    handleStartQuiz();
    setShowProgressTracker(true);
    setShowPractice(true);
  };

  const handleProgressUpdate = (progress: PracticeProgress) => {
    setCurrentProgress(progress);
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="mb-4 font-bold text-gold text-xl">Flash Cards Settings</h2>
      <div className="flex flex-col items-center gap-4 bg-black p-8 border-2 border-boxGold rounded-lg">
        <div className="tablet:gap-4 items-center gap-2 grid grid-cols-2 py-4 w-full">
          <p className="text-md text-left">Number of Questions: </p>
          <input
            type="number"
            className="px-2 py-1 border border-grey rounded-md focus:outline-none w-full text-black text-center"
            value={Number(numberOfQuestions)}
            max={1000}
            onChange={(e) => setNumberOfQuestions(parseInt(e.target.value, 10))}
          />
        </div>
        <div className="tablet:gap-4 items-center gap-2 grid grid-cols-2 py-4 w-full">
          <p className="text-md text-left">Number of Digits: </p>
          <input
            type="number"
            className="px-2 py-1 border border-grey rounded-md focus:outline-none w-full text-black text-center"
            value={Number(numberOfDigits)}
            max={15}
            min={1}
            onChange={(e) => setNumberOfDigits(parseInt(e.target.value, 10))}
          />
        </div>
        <div className="tablet:gap-4 items-center gap-2 grid grid-cols-2 py-4 w-full">
          <p className="text-md text-left">Number of Rows: </p>
          <input
            type="number"
            className="px-2 py-1 border border-grey rounded-md focus:outline-none w-full text-black text-center"
            value={Number(numberOfRows)}
            max={15}
            min={1}
            onChange={(e) => setNumberOfRows(parseInt(e.target.value, 10))}
          />
        </div>
        {operation === 'addition' && (
          <div className="tablet:gap-4 items-center gap-2 grid grid-cols-2 py-4 w-full">
            <p className="text-md text-left">Zig-Zag Pattern: </p>
            <input
              type="checkbox"
              className="bg-gold px-2 py-1 border rounded-md w-full h-4 text-black text-center accent-gold"
              checked={isZigzag}
              onChange={(e) => setIsZigzag(e.target.checked)}
            />
          </div>
        )}
        {operation === 'addition' && (
          <div className="tablet:gap-4 items-center gap-2 grid grid-cols-2 py-4 w-full">
            <p className="text-md text-left">Include Subtraction: </p>
            <input
              type="checkbox"
              className="bg-gold px-2 py-1 border rounded-md w-full h-4 text-black text-center accent-gold"
              checked={includeSubtraction}
              onChange={(e) => setIncludeSubtraction(e.target.checked)}
            />
          </div>
        )}
        {operation === 'addition' && (
          <div className="tablet:gap-4 items-center gap-2 grid grid-cols-2 py-4 w-full">
            <p className="text-md text-left">
              Same number of digits in answer as question:
            </p>
            <input
              type="checkbox"
              className="bg-gold px-2 py-1 border rounded-md w-full h-4 text-black text-center accent-gold"
              checked={persistNumberOfDigits}
              onChange={(e) => setPersistNumberOfDigits(e.target.checked)}
            />
          </div>
        )}
        <div className="tablet:gap-4 items-center gap-2 grid grid-cols-2 py-4 w-full">
          <p className="text-md text-left">Flash Card Speed: </p>
          <div className="flex flex-col items-center">
            <input
              name="speed"
              className="px-2 py-1 border border-grey rounded-md outline-none focus:outline-none w-full text-black text-center accent-gold"
              id="speed"
              type="range"
              min={100}
              max={5000}
              
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value, 10))}
            />
            <div className="tablet:gap-4 flex justify-center items-center gap-2">
              <input
                type="number"
                className="tablet:w-40 py-1 border border-grey rounded-md focus:outline-none text-black text-center"
                value={Number(speed)}
                min={100}
                max={5000}
                onChange={(e) => setSpeed(parseInt(e.target.value, 10))}
              />
              <p className="flex-1 text-nowrap">
                ms ({speed < 1500 ? 'Fast' : speed > 2500 ? 'Slow' : 'Medium'})
              </p>
            </div>
          </div>
        </div>

        {/* Audio Mode Settings */}
        <div className="tablet:gap-4 items-center gap-2 grid grid-cols-2 py-4 w-full">
          <div className="text-left">
            <p className="text-md text-gold font-bold">🔊 Audio Mode</p>
            <p className="text-xs text-white/60">Questions read aloud, you type answers</p>
          </div>
          <div className="flex justify-end">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={audioMode}
                onChange={(e) => setAudioMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-grey peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gold/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
            </label>
          </div>
        </div>
        {audioMode && (
          <div className="tablet:gap-4 items-center gap-2 grid grid-cols-2 py-4 w-full">
            <p className="text-md text-left">🎵 Speech Pace: </p>
            <select
              value={audioPace}
              onChange={(e) => setAudioPace(e.target.value)}
              className="px-2 py-1 border border-grey rounded-md focus:outline-none w-full text-black text-center"
            >
              <option value="slow">🐌 SLOW - Easy to Follow</option>
              <option value="normal">👤 NORMAL - Natural Speed</option>
              <option value="fast">⚡ FAST - Quick Challenge</option>
              <option value="ultra">🚀 ULTRA - Lightning Speed</option>
            </select>
          </div>
        )}
        {audioMode && (
          <div className="tablet:gap-4 items-center gap-2 grid grid-cols-2 py-4 w-full">
            <div className="text-left">
              <p className="text-md text-gold font-bold">👁️ Question Visibility</p>
              <p className="text-xs text-white/60">Toggle with 👁️ button during practice</p>
            </div>
            <div className="flex justify-end">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showQuestion}
                  onChange={(e) => setShowQuestion(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-grey peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gold/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
              </label>
            </div>
          </div>
        )}
        {audioMode && (
          <div className="tablet:gap-4 items-center gap-2 grid grid-cols-1 py-2 w-full">
          </div>
        )}

        <div className="tablet:gap-4 items-center gap-2 grid grid-cols-1 w-full">
          <div
            className="text-center"
            onClick={() => verifyAndStartQuiz()}
            tabIndex={0}
            role="button"
            onKeyDown={() => verifyAndStartQuiz()}
          >
            <Button type="primary" text="Start Practice" />
          </div>
        </div>
      </div>

      {/* Real-Time Progress Tracker and Practice */}
      {showProgressTracker && (
        <div className="mt-6">
          <PracticeProvider
            operation={operation}
            numberOfQuestions={numberOfQuestions}
            numberOfDigits={numberOfDigits}
            numberOfRows={numberOfRows}
            isZigzag={isZigzag}
            includeSubtraction={includeSubtraction}
            persistNumberOfDigits={persistNumberOfDigits}
            audioMode={audioMode}
            audioPace={audioPace}
            showQuestion={showQuestion}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PracticeProgressTracker
                operation={operation}
                numberOfQuestions={numberOfQuestions}
                numberOfDigits={numberOfDigits}
                numberOfRows={numberOfRows}
                isZigzag={isZigzag}
                includeSubtraction={includeSubtraction}
                persistNumberOfDigits={persistNumberOfDigits}
                audioMode={audioMode}
                audioPace={audioPace}
                showQuestion={showQuestion}
                onProgressUpdate={handleProgressUpdate}
              />
              
              {showPractice && (
                <FlashCardPractice
                  operation={operation}
                  numberOfQuestions={numberOfQuestions}
                  numberOfDigits={numberOfDigits}
                  speed={speed}
                />
              )}
            </div>
          </PracticeProvider>
        </div>
      )}

      {/* Progress Summary */}
      {currentProgress && currentProgress.isCompleted && (
        <div className="mt-6 bg-gradient-to-r from-green/20 to-blue/20 backdrop-blur-xl p-6 rounded-2xl border border-green/50">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-green mb-4">🎉 Practice Completed!</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gold">{currentProgress.correctAnswers}</div>
                <div className="text-white/80 text-sm">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-400">{currentProgress.incorrectAnswers}</div>
                <div className="text-white/80 text-sm">Incorrect</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue">{currentProgress.accuracyPercentage.toFixed(1)}%</div>
                <div className="text-white/80 text-sm">Accuracy</div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">
                Time: {Math.floor(currentProgress.timeElapsed / 60)}:{(currentProgress.timeElapsed % 60).toString().padStart(2, '0')}
              </div>
              <div className="text-white/80 text-sm">
                Average: {(currentProgress.timeElapsed / currentProgress.totalQuestions).toFixed(1)}s per question
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashCardsForm;
