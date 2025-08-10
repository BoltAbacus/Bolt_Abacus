import { Dispatch, FC, SetStateAction } from 'react';
import swal from 'sweetalert';

import Button from '@components/atoms/Button';

export interface UnTimedPracticeFormProps {
  operation: 'addition' | 'multiplication' | 'division';
  numberOfQuestions: number;
  setNumberOfQuestions: Dispatch<SetStateAction<number>>;
  numberOfDigitsLeft: number;
  setNumberOfDigitsLeft: Dispatch<SetStateAction<number>>;
  numberOfDigitsRight: number;
  setNumberOfDigitsRight: Dispatch<SetStateAction<number>>;
  numberOfRows: number;
  setNumberOfRows: Dispatch<SetStateAction<number>>;
  audioMode: boolean;
  setAudioMode: Dispatch<SetStateAction<boolean>>;
  audioPace: string;
  setAudioPace: Dispatch<SetStateAction<string>>;
  showQuestion: boolean;
  setShowQuestion: Dispatch<SetStateAction<boolean>>;
  handleStartQuiz: () => void;
}

const UnTimedPracticeForm: FC<UnTimedPracticeFormProps> = ({
  operation,
  numberOfQuestions,
  numberOfDigitsLeft,
  numberOfDigitsRight,
  numberOfRows,
  audioMode,
  audioPace,
  showQuestion,
  setNumberOfQuestions,
  setNumberOfDigitsLeft,
  setNumberOfDigitsRight,
  setNumberOfRows,
  setAudioMode,
  setAudioPace,
  setShowQuestion,
  handleStartQuiz,
}) => {
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

    if (!numberOfDigitsLeft || numberOfDigitsLeft <= 0 || numberOfDigitsLeft > 15) {
      swal({
        title: 'Invalid number of digits',
        text: 'Please enter between 1 and 15 digits',
        icon: 'error',
      });
      return;
    }

    if (!numberOfDigitsRight || numberOfDigitsRight <= 0 || numberOfDigitsRight > 15) {
      swal({
        title: 'Invalid number of digits',
        text: 'Please enter between 1 and 15 digits',
        icon: 'error',
      });
      return;
    }

    if (operation === 'division' && numberOfDigitsRight > numberOfDigitsLeft) {
      swal({
        title: 'Invalid number of digits',
        text: 'Numerator digits should be greater than denominator digits',
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

    handleStartQuiz();
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="mb-4 font-bold text-gold text-xl">
        No Rush Mastery Settings
      </h2>
      <div className="flex flex-col items-center gap-4 bg-black p-8 border-2 border-boxGold rounded-lg">
        <div className="tablet:gap-4 items-center gap-2 grid grid-cols-2 py-4 w-full">
          <p className="text-md text-left">Number of Questions: </p>
          <input
            type="number"
            className="px-2 py-1 border border-grey rounded-md focus:outline-none w-full text-black text-center"
            value={Number(numberOfQuestions)}
            max={1000}
            min={1}
            onChange={(e) => setNumberOfQuestions(parseInt(e.target.value, 10))}
          />
        </div>
        <div className="tablet:gap-4 items-center gap-2 grid grid-cols-2 py-4 w-full">
          <p className="text-md text-left">
            Number of Digits ({operation === 'division' ? 'Numerator' : 'Left'}):{' '}
          </p>
          <input
            type="number"
            className="px-2 py-1 border border-grey rounded-md focus:outline-none w-full text-black text-center"
            value={Number(numberOfDigitsLeft)}
            max={15}
            min={1}
            onChange={(e) => setNumberOfDigitsLeft(parseInt(e.target.value, 10))}
          />
        </div>
        <div className="tablet:gap-4 items-center gap-2 grid grid-cols-2 py-4 w-full">
          <p className="text-md text-left">
            Number of Digits ({operation === 'division' ? 'Denominator' : 'Right'}):{' '}
          </p>
          <input
            type="number"
            className="px-2 py-1 border border-grey rounded-md focus:outline-none w-full text-black text-center"
            value={Number(numberOfDigitsRight)}
            max={15}
            min={1}
            onChange={(e) => setNumberOfDigitsRight(parseInt(e.target.value, 10))}
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
            <p className="text-xs text-white/60 text-center">🎧 Questions read aloud, you type answers. Toggle visibility with 👁️ button.</p>
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
    </div>
  );
};

export default UnTimedPracticeForm;
