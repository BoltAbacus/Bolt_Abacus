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
import { RxCross1, RxPlus } from 'react-icons/rx';
import { PiDivide } from 'react-icons/pi';

import { QuizQuestion } from '@interfaces/apis/student';

export interface QuizBoxProps {
  quizQuestion: QuizQuestion;
  answer: string;
  setAnswer: Dispatch<SetStateAction<string>>;
  setDisabled: Dispatch<SetStateAction<boolean>>;
  submitAnswer: () => void;
  operation?: 'addition' | 'multiplication' | 'division';
  includeDecimals?: boolean;
  audioMode?: boolean;
  audioPace?: string;
  showQuestion?: boolean;
  setShowQuestion?: Dispatch<SetStateAction<boolean>>;
}

const QuizBox: FC<QuizBoxProps> = ({
  quizQuestion,
  answer,
  setAnswer,
  setDisabled,
  submitAnswer,
  operation,
  includeDecimals = false,
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
    let result = event.target.value;
    
    // Allow decimal input for division with decimals enabled or for operations that might result in decimals
    if ((operation === 'division' && includeDecimals) || 
        quizQuestion.question.operator === 'sqrt' || 
        quizQuestion.question.operator === 'cuberoot' ||
        quizQuestion.question.operator === '/') {
      // Allow numbers, minus sign, and decimal point
      result = result.replace(/[^0-9.-]/gi, '');
      // Ensure only one decimal point
      const parts = result.split('.');
      if (parts.length > 2) {
        result = parts[0] + '.' + parts.slice(1).join('');
      }
    } else {
      // For other operations, only allow integers
      result = result.replace(/[^0-9-]/gi, '');
    }
    
    setAnswer(result);

    // Validate the number
    const shouldUseFloat = (operation === 'division' && includeDecimals) || 
                          quizQuestion.question.operator === 'sqrt' || 
                          quizQuestion.question.operator === 'cuberoot' ||
                          quizQuestion.question.operator === '/';
    const num = shouldUseFloat ? parseFloat(result) : parseInt(result, 10);
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

  // Audio reading functionality
  const readQuestion = async () => {
    if (!audioMode) return;
    
    setIsReading(true);
    const numbers = quizQuestion.question.numbers;
    const operator = quizQuestion.question.operator;
    
    let questionText = '';
    if (operator === '+') {
      // Handle multiple numbers for addition (when numberOfRows > 2)
      if (numbers.length > 2) {
        const allNumbers = numbers.map(num => num.toString()).join(' plus ');
        questionText = allNumbers;
      } else {
        questionText = `${numbers[0]} plus ${numbers[1]}`;
      }
    } else if (operator === '*') {
      questionText = `${numbers[0]} times ${numbers[1]}`;
    } else if (operator === '/') {
      questionText = `${numbers[0]} divided by ${numbers[1]}`;
    } else if (operator === 'sqrt') {
      questionText = `square root of ${numbers[0]}`;
    } else if (operator === 'cuberoot') {
      questionText = `cube root of ${numbers[0]}`;
    } else if (operator === 'square' || operator === '^2') {
      questionText = `${numbers[0]} squared`;
    } else if (operator === 'cube' || operator === '^3') {
      questionText = `${numbers[0]} cubed`;
    }
    
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
    if (propShowQuestion === undefined) {
      setShowQuestion(!audioMode);
    }

    // Read question aloud if audio mode is enabled
    if (audioMode) {
      setTimeout(() => {
        readQuestion();
      }, 500);
    }

    return () => {
      speechSynthesis.cancel();
    };
  }, [quizQuestion, audioMode, audioPace]);

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
            {showQuestion ? (
              <>
                <span className="text-4xl tablet:text-5xl desktop:text-6xl text-gold">
                  {quizQuestion.question.operator === '*' ? (
                    <RxCross1 />
                  ) : quizQuestion.question.operator === '+' ? (
                    <RxPlus />
                  ) : quizQuestion.question.operator === '/' ? (
                    <PiDivide />
                  ) : quizQuestion.question.operator === 'sqrt' ? (
                    <span className="text-3xl">√</span>
                  ) : quizQuestion.question.operator === 'cuberoot' ? (
                    <span className="text-3xl">∛</span>
                  ) : quizQuestion.question.operator === 'square' || quizQuestion.question.operator === '^2' ? (
                    <span className="text-3xl">²</span>
                  ) : quizQuestion.question.operator === 'cube' || quizQuestion.question.operator === '^3' ? (
                    <span className="text-3xl">³</span>
                  ) : (
                    <PiDivide />
                  )}
                </span>
                <div className="flex flex-col items-end gap-2 tracking-widest">
                  {quizQuestion.question.numbers.map((number, index) => {
                    const fullNumber = BigInt(number);
                    return (
                      <span key={index} className="text-3xl tablet:text-4xl desktop:text-5xl text-white font-bold">
                        {fullNumber.toString()}
                      </span>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="border-2 border-grey rounded-lg font-bold text-grey p-4">
                <p className="text-xl">🔊 Listen</p>
              </div>
            )}
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

export default QuizBox;
