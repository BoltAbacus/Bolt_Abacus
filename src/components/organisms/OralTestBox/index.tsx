import {
  ChangeEvent,
  KeyboardEvent,
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useRef,
} from 'react';

export interface OralTestBoxProps {
  answer: string;
  questionNumber: number;
  setAnswer: Dispatch<SetStateAction<string>>;
  setDisabled: Dispatch<SetStateAction<boolean>>;
  submitAnswer: () => void;
  allowDecimals?: boolean;
}

const OralTestBox: FC<OralTestBoxProps> = ({
  answer,
  questionNumber,
  setAnswer,
  setDisabled,
  submitAnswer,
  allowDecimals = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    let result = event.target.value;
    
    if (allowDecimals) {
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

    const num = allowDecimals ? parseFloat(result) : parseInt(result, 10);
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

  return (
    <div className="w-full min-h-[400px] flex justify-center items-center p-6 py-8 bg-darkBlack shadow-boxWhite rounded-2xl">
      <div className="flex flex-col gap-8 items-center w-full justify-evenly">
        <p className="font-bold text-xl tablet:text-2xl desktop:text-3xl text-center text-white">
          Please enter answer for question {questionNumber} below
        </p>
        <input
          className="w-32 px-4 py-3 bg-darkBlack outline-none border-2 text-center border-[#A0A0A0] rounded-lg tablet:w-40 desktop:w-48 text-2xl tablet:text-3xl desktop:text-4xl font-bold"
          type="text"
          inputMode="decimal"
          value={answer}
          ref={inputRef}
          onChange={(e) => handleChange(e)}
          onKeyDown={(e) => handleEnter(e)}
        />
      </div>
    </div>
  );
};

export default OralTestBox;
