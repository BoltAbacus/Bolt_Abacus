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
    const questionText = quizQuestion.question.numbers.join(' plus ');
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
    <div className="flex flex-col justify-center items-center bg-darkBlack shadow-boxWhite p-2 py-6 rounded-2xl w-full min-h-[300px]">
      {/* Audio Mode Controls */}
      {audioMode && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={readQuestion}
            disabled={isReading}
            className="bg-gold hover:bg-lightGold disabled:bg-grey text-black font-bold py-2 px-3 rounded-lg transition-colors"
          >
            {isReading ? '🔊 Reading...' : '🔊 Read Again'}
          </button>
          {showQuestion && (
            <button
              onClick={toggleQuestionVisibility}
              className="bg-purple hover:bg-pink-500 text-white font-bold py-2 px-3 rounded-lg transition-colors"
            >
              👁️ Hide
            </button>
          )}
        </div>
      )}

      <div className="flex justify-evenly items-center gap-4 w-full overflow-auto font-bold text-lg tablet:text-xl">
        <div className="flex flex-col">
          <div className="tablet:gap-10 flex items-center gap-4">
            <div className="flex flex-col items-end gap-1 tracking-widest">
              {showQuestion ? (
                <div
                  key={currentIndex}
                  className={`border-2 border-gold rounded-lg font-bold text-gold
                              ${animate ? 'animate-fadeIn' : 'opacity-0'} p-2 tablet:p-4`}
                >
                  <p>{BigInt(currentNumber).toString()}</p>
                </div>
              ) : (
                <div className="border-2 border-grey rounded-lg font-bold text-grey p-2 tablet:p-4">
                  <p>🔊 Listen</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="text-gold text-2xl desktop:text-3xl"> = </div>
        <div className="">
          <input
            className="tablet:w-32 bg-darkBlack px-4 py-3 border border-[#A0A0A0] rounded-lg outline-none w-20 text-center"
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
        <div className="absolute bottom-4 left-4 right-4 text-center">
          <p className="text-white/60 text-sm">
            🎧 Question read aloud. Click 👁️ to show question or 🔊 to read again.
          </p>
        </div>
      )}
    </div>
  );
};

export default FlashCardBox;
