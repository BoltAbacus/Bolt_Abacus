import {
  ChangeEvent,
  KeyboardEvent,
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';

import { QuizQuestion } from '@interfaces/apis/student';

export interface FlashCardBoxProps {
  speed: number;
  quizQuestion: QuizQuestion;
  answer: string;
  setAnswer: Dispatch<SetStateAction<string>>;
  setDisabled: Dispatch<SetStateAction<boolean>>;
  submitAnswer: () => void;
  audioMode?: boolean;
  audioPace?: string;
  showQuestion?: boolean;
  setShowQuestion?: Dispatch<SetStateAction<boolean>>;
}

const FlashCardBox: FC<FlashCardBoxProps> = ({
  speed,
  quizQuestion,
  answer,
  setAnswer,
  setDisabled,
  submitAnswer,
  audioMode = false,
  audioPace = 'normal',
  showQuestion: propShowQuestion,
  setShowQuestion: propSetShowQuestion,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalShowQuestion, setInternalShowQuestion] = useState(!audioMode);
  const [isReading, setIsReading] = useState(false);
  
  // Use prop values if provided, otherwise use internal state
  const showQuestion = propShowQuestion !== undefined ? propShowQuestion : internalShowQuestion;
  const setShowQuestion = propSetShowQuestion || setInternalShowQuestion;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const result = event.target.value.replace(/[^0-9-]/gi, '');
    setAnswer(result);

    const num = parseInt(result, 10);
    if (Number.isNaN(num)) setDisabled(true);
    else setDisabled(false);
  };

  const handleEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.code === 'Enter' || event.code === 'NumpadEnter') {
      submitAnswer();
    }
  };

  useEffect(() => {
    inputRef?.current?.focus();
  });

  const [currentNumber, setCurrentNumber] = useState(
    quizQuestion.question.numbers[0]
  );

  const [currentIndex, setCurrentIndex] = useState(0);

  // Audio reading functionality
  const readQuestion = async () => {
    if (!audioMode) return;
    
    setIsReading(true);
    // Ensure all numbers are properly converted to strings for speech synthesis
    const questionText = quizQuestion.question.numbers.map(num => num.toString()).join(' plus ');
    const utterance = new SpeechSynthesisUtterance(questionText);
    
    // Set speech rate based on pace
    switch (audioPace) {
      case 'slow':
        utterance.rate = 0.7;
        break;
      case 'normal':
        utterance.rate = 1.0;
        break;
      case 'fast':
        utterance.rate = 1.3;
        break;
      case 'ultra':
        utterance.rate = 1.6;
        break;
      default:
        utterance.rate = 1.0;
    }
    
    utterance.onend = () => {
      setIsReading(false);
    };
    
    speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    setCurrentIndex(0);
    setCurrentNumber(quizQuestion.question.numbers[0]);
    if (propShowQuestion === undefined) {
      setShowQuestion(!audioMode);
    }

    // Read question aloud if audio mode is enabled
    if (audioMode) {
      setTimeout(() => {
        readQuestion();
      }, 500);
    }

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex < quizQuestion.question.numbers.length) {
          setCurrentNumber(quizQuestion.question.numbers[nextIndex]);
          return nextIndex;
        }
        clearInterval(interval);
        return prevIndex;
      });
    }, speed);

    return () => {
      clearInterval(interval);
      speechSynthesis.cancel();
    };
  }, [quizQuestion, speed, audioMode, audioPace]);

  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(false);
    setTimeout(() => setAnimate(true), 50);
  }, [currentNumber]);

  const toggleQuestionVisibility = () => {
    setShowQuestion(!showQuestion);
  };

  return (
    <div className="flex flex-col justify-center items-center bg-darkBlack shadow-boxWhite p-6 py-8 rounded-2xl w-full min-h-[400px]">
      {/* Audio Mode Controls */}
      {audioMode && (
        <div className="flex gap-3 mb-6">
          <button
            onClick={readQuestion}
            disabled={isReading}
            className="bg-gold hover:bg-lightGold disabled:bg-grey text-black font-bold py-2 px-4 rounded-lg transition-colors"
          >
            {isReading ? '🔊 Reading...' : '🔊 Read Again'}
          </button>
          <button
            onClick={toggleQuestionVisibility}
            className="bg-purple hover:bg-pink-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            {showQuestion ? '👁️ Hide' : '👁️ Show'}
          </button>
        </div>
      )}

      <div className="flex justify-evenly items-center gap-6 w-full overflow-auto">
        <div className="flex flex-col">
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end gap-2 tracking-widest">
              {showQuestion ? (
                <div
                  key={currentIndex}
                  className={`border-2 border-gold rounded-lg font-bold text-gold
                              ${animate ? 'animate-fadeIn' : 'opacity-0'} p-4 tablet:p-6`}
                >
                  <p className="text-3xl tablet:text-4xl desktop:text-5xl">{BigInt(currentNumber).toString()}</p>
                </div>
              ) : (
                <div className="border-2 border-grey rounded-lg font-bold text-grey p-4">
                  <p className="text-xl">🔊 Listen</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="text-gold text-4xl tablet:text-5xl desktop:text-6xl font-bold"> = </div>
        <div className="">
          <input
            className="bg-darkBlack px-4 py-3 border-2 border-[#A0A0A0] rounded-lg outline-none text-center text-2xl tablet:text-3xl desktop:text-4xl font-bold w-24 tablet:w-32 desktop:w-40"
            type="text"
            inputMode="decimal"
            value={answer}
            ref={inputRef}
            onChange={(e) => handleChange(e)}
            onKeyDown={(e) => handleEnter(e)}
            placeholder={audioMode && !showQuestion ? "Type answer..." : ""}
          />
        </div>
      </div>

      {/* Audio Mode Instructions */}
      {audioMode && !showQuestion && (
        <div className="absolute bottom-6 left-6 right-6 text-center">
          <p className="text-white/60 text-sm">
            🎧 Question read aloud. Click 👁️ to show question or 🔊 to read again.
          </p>
        </div>
      )}
    </div>
  );
};

export default FlashCardBox;
