import { FC, useState, useEffect } from 'react';
import { usePracticeContext } from '../../../contexts/PracticeContext';
import ProgressUpdateButton from '../../atoms/ProgressUpdateButton';

interface FlashCardPracticeProps {
  operation: 'addition' | 'multiplication' | 'division';
  numberOfQuestions: number;
  numberOfDigits: number;
  speed: number;
}

const FlashCardPractice: FC<FlashCardPracticeProps> = ({
  operation,
  numberOfQuestions,
  numberOfDigits,
  speed,
}) => {
  const { progress, startTracking, isTracking } = usePracticeContext();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState<Array<{ question: string; answer: number }>>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);

  // Generate questions
  useEffect(() => {
    const generatedQuestions = [];
    for (let i = 0; i < numberOfQuestions; i++) {
      const num1 = Math.floor(Math.random() * Math.pow(10, numberOfDigits));
      const num2 = Math.floor(Math.random() * Math.pow(10, numberOfDigits));
      
      let question = '';
      let answer = 0;
      
      switch (operation) {
        case 'addition':
          question = `${num1} + ${num2}`;
          answer = num1 + num2;
          break;
        case 'multiplication':
          question = `${num1} × ${num2}`;
          answer = num1 * num2;
          break;
        case 'division':
          const divisor = num2 || 1;
          question = `${num1 * divisor} ÷ ${divisor}`;
          answer = num1;
          break;
      }
      
      generatedQuestions.push({ question, answer });
    }
    setQuestions(generatedQuestions);
  }, [operation, numberOfQuestions, numberOfDigits]);

  // Start tracking when component mounts
  useEffect(() => {
    if (!isTracking) {
      startTracking();
    }
  }, [isTracking, startTracking]);

  // Auto-advance questions based on speed
  useEffect(() => {
    if (isTracking && currentQuestion < questions.length) {
      const timer = setTimeout(() => {
        setShowAnswer(true);
        
        const answerTimer = setTimeout(() => {
          setShowAnswer(false);
          setCurrentQuestion(prev => prev + 1);
          setUserAnswer('');
          setIsCorrect(false);
        }, 2000); // Show answer for 2 seconds
        
        return () => clearTimeout(answerTimer);
      }, speed);
      
      return () => clearTimeout(timer);
    }
  }, [currentQuestion, questions.length, speed, isTracking]);

  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userAnswerNum = parseInt(userAnswer);
    const correct = userAnswerNum === questions[currentQuestion]?.answer;
    setIsCorrect(correct);
    setShowAnswer(true);
  };

  if (currentQuestion >= questions.length) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-gold mb-4">Practice Complete!</h2>
        <p className="text-white">You've completed all {numberOfQuestions} questions.</p>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="bg-black/80 backdrop-blur-xl p-8 rounded-2xl border border-gold/50 shadow-2xl">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gold mb-2">Flash Card Practice</h2>
        <p className="text-white/80">Question {currentQuestion + 1} of {numberOfQuestions}</p>
      </div>

      <div className="bg-[#1a1a1a] rounded-xl p-8 border border-gold/30 mb-6">
        <div className="text-center">
          <div className="text-6xl font-bold text-white mb-6">
            {currentQ?.question}
          </div>
          
          {showAnswer ? (
            <div className="text-4xl font-bold text-gold mb-4">
              = {currentQ?.answer}
            </div>
          ) : (
            <form onSubmit={handleAnswerSubmit} className="mb-4">
              <input
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="text-4xl font-bold text-center bg-transparent border-b-4 border-gold text-white focus:outline-none w-32"
                placeholder="?"
                autoFocus
              />
              <button
                type="submit"
                className="ml-4 bg-gold text-black font-bold py-2 px-4 rounded-lg hover:bg-lightGold transition-colors"
              >
                Submit
              </button>
            </form>
          )}
          
          {showAnswer && (
            <div className={`text-2xl font-bold ${isCorrect ? 'text-green' : 'text-red-400'}`}>
              {isCorrect ? '✅ Correct!' : '❌ Incorrect'}
            </div>
          )}
        </div>
      </div>

      {/* Progress Update Buttons */}
      <div className="flex gap-4 justify-center">
        <ProgressUpdateButton
          isCorrect={true}
          className="bg-green text-black font-bold py-3 px-6 rounded-xl hover:bg-lightGreen transition-colors"
        >
          ✅ Correct
        </ProgressUpdateButton>
        <ProgressUpdateButton
          isCorrect={false}
          className="bg-red-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-red-600 transition-colors"
        >
          ❌ Incorrect
        </ProgressUpdateButton>
      </div>

      {/* Progress Display */}
      <div className="mt-6 text-center">
        <div className="text-white/80 text-sm">
          Progress: {progress.currentQuestion} / {progress.totalQuestions} 
          ({progress.progressPercentage.toFixed(1)}%)
        </div>
        <div className="text-green text-sm">
          Accuracy: {progress.accuracyPercentage.toFixed(1)}%
        </div>
        <div className="text-blue text-sm">
          Time: {Math.floor(progress.timeElapsed / 60)}:{(progress.timeElapsed % 60).toString().padStart(2, '0')}
        </div>
      </div>
    </div>
  );
};

export default FlashCardPractice;
