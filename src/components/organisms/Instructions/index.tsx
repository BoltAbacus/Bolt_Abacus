import QuizActionButton from '@components/atoms/QuizActionButton';
import {
  quizInstructions,
  testInstructions,
} from '@constants/instructionDetails';
import { Dispatch, FC, SetStateAction } from 'react';

export interface InstructionsProps {
  type: 'quiz' | 'test';
  startQuiz: Dispatch<SetStateAction<boolean>>;
}

const Instructions: FC<InstructionsProps> = ({ type, startQuiz }) => {
  const startQuizHandler = () => {
    startQuiz(true);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col gap-6 border border-gold px-14 py-8 bg-darkBlack rounded-lg max-w-md w-full mx-4 text-center">
        <p className="text-xl text-gold font-bold">Instructions</p>
        <div className="text-md p-1">
          {type === 'quiz' ? (
            <ul className="space-y-2">
              {quizInstructions.map((instruction, index) => (
                <li key={index} className="text-white">{instruction}</li>
              ))}
            </ul>
          ) : (
            <ul className="space-y-2">
              {testInstructions.map((instruction, index) => (
                <li key={index} className="text-white">{instruction}</li>
              ))}
            </ul>
          )}
        </div>
        <div
          role="button"
          className="p-1 flex justify-center"
          onClick={startQuizHandler}
          onKeyPress={startQuizHandler}
          tabIndex={0}
        >
          <QuizActionButton type="next" text="Start Quiz" />
        </div>
      </div>
    </div>
  );
};

export default Instructions;
