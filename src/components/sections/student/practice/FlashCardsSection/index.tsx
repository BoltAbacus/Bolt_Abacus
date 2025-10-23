import { FC, useState, useEffect } from 'react';
import { useStopwatch } from 'react-timer-hook';
import { isAxiosError } from 'axios';

import QuizActionButton from '@components/atoms/QuizActionButton';
import PracticeHeader from '@components/molecules/PracticeHeader';
import FlashCardsForm from '@components/organisms/FlashCardsForm';

import LoadingSection from '@components/organisms/LoadingBox';
import ResultSection from '@components/sections/student/practice/ResultSection';
import ErrorSection from '@components/sections/student/quiz/ErrorSection';

import {
  QuestionResult,
  QuizAnswer,
  QuizQuestion,
} from '@interfaces/apis/student';
import {
  generatePracticeAnswers,
  generatePracticeQuestions,
  generateResult,
} from '@helpers/questionBuilder';
import { practiceSubmitRequest } from '@services/student';
import { logActivity } from '@helpers/activity';

import { useAuthStore } from '@store/authStore';
import { ERRORS, MESSAGES } from '@constants/app';
import FlashCardBox from '@components/organisms/FlashCardBox';
import { useProblemTimer } from '@hooks/useProblemTimer';

export interface FlashCardsSectionProps {
  operation: 'addition' | 'multiplication' | 'division';
}

const FlashCardsSection: FC<FlashCardsSectionProps> = ({ operation }) => {
  const authToken = useAuthStore((state) => state.authToken);

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);

  const [quizQuestions, setQuizQuestions] = useState<Array<QuizQuestion>>([]);
  const [quizAnswers, setQuizAnswers] = useState<Array<QuizAnswer>>([]);

  const [quizResult, setQuestionResult] = useState<Array<QuestionResult>>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [averageTime, setAverageTime] = useState(0);

  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [numberOfDigits, setNumberOfDigits] = useState(1);
  const [numberOfRows, setNumberOfRows] = useState(2);
  const [isZigzag, setIsZigzag] = useState(false);
  const [includeSubtraction, setIncludeSubtraction] = useState(operation === 'addition');
  const [persistNumberOfDigits, setPersistNumberOfDigits] = useState(false);
  const [speed, setSpeed] = useState<number>(2500);
  const [audioMode, setAudioMode] = useState(false);
  const [audioPace, setAudioPace] = useState('normal');
  const [showQuestion, setShowQuestion] = useState(true);
  const [includeDecimals, setIncludeDecimals] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isNextDisabled, setIsNextDisabled] = useState(true);

  const { start, pause, totalSeconds, seconds, minutes } = useStopwatch({
    autoStart: false,
  });

  const { startProblem, endProblem, getProblemTimes } = useProblemTimer();

  // Start timing when a new question is shown
  useEffect(() => {
    if (isQuizStarted && quizQuestions.length > 0 && currentIndex < quizQuestions.length) {
      startProblem(quizQuestions[currentIndex].questionId.toString());
    }
  }, [isQuizStarted, currentIndex, quizQuestions, startProblem]);

  const calculateAnswer = (question: { operator: string; numbers: number[] }) => {
    const { operator, numbers } = question;
    
    switch (operator) {
      case 'addition':
        return numbers.reduce((sum, num) => sum + num, 0);
      case 'subtraction':
        return numbers.reduce((diff, num, index) => index === 0 ? num : diff - num);
      case 'multiplication':
        return numbers.reduce((product, num) => product * num, 1);
      case 'division':
        return numbers.reduce((quotient, num, index) => index === 0 ? num : quotient / num);
      default:
        return 0;
    }
  };

  const getUpdatedAnswers = (ans: string | null) => {
    const { questionId } = quizQuestions[currentIndex];
    const isDivision = operation === 'division' && includeDecimals;
    const answer = isDivision ? parseFloat(ans!) : parseInt(ans!, 10);
    const answers = quizAnswers.map((a) => {
      if (a.questionId === questionId) {
        return {
          ...a,
          answer: Number.isNaN(answer) ? null : answer,
        };
      }
      return a;
    });

    return answers;
  };

  const submitQuiz = async (timeTaken: number) => {
    const answers = getUpdatedAnswers(currentAnswer);
    setLoading(true);
    setIsQuizCompleted(true);

    const { result, totalScore: score } = generateResult(
      quizQuestions,
      answers
    );
    
    // Get detailed problem times
    const problemTimes = getProblemTimes();
    const avg = timeTaken / quizQuestions.length;

    setAverageTime(parseFloat(avg.toFixed(2)));
    setTotalScore(score);
    setQuestionResult(result);

    try {
      await practiceSubmitRequest(
        'flashcards',
        operation,
        numberOfDigits,
        numberOfQuestions,
        numberOfRows,
        isZigzag,
        includeSubtraction,
        persistNumberOfDigits,
        false,
        score,
        totalSeconds,
        parseFloat(avg.toFixed(2)),
        authToken!,
        problemTimes // Include detailed problem times
      );
      logActivity({
        type: 'practice',
        title: `Flashcards Practice (${operation}) completed with score ${score}`,
        xp: undefined,
        meta: { operation, numberOfDigits, numberOfQuestions, problemTimes }
      });
      try {
        window.dispatchEvent(new Event('practiceSessionCompleted'));
      } catch {}
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);

      if (isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 409) {
          setApiError(null);
        } else {
          setApiError(error.response?.data?.message || ERRORS.SERVER_ERROR);
        }
      } else {
        setApiError(ERRORS.SERVER_ERROR);
      }
    }
    setLoading(false);
  };

  const handleStartQuiz = () => {
    // Save practice mode settings to localStorage
    const practiceSettings = {
      numberOfDigitsLeft: numberOfDigits,
      numberOfDigitsRight: numberOfDigits,
      isZigzag,
      numberOfRows,
      includeSubtraction,
      persistNumberOfDigits,
      includeDecimals: false,
      audioMode,
      audioPace,
      showQuestion,
      operation,
      game_mode: 'flashcards',
      number_of_digits: numberOfDigits,
      time_per_question: speed / 1000, // Convert milliseconds to seconds
      number_of_questions: numberOfQuestions,
      difficulty_level: 'medium',
      flashcard_speed: speed // Store the actual speed in milliseconds
    };
    
    try {
      localStorage.setItem('practiceModeSettings', JSON.stringify(practiceSettings));
    } catch (error) {
      console.log('Error saving practice mode settings:', error);
    }

    setLoading(true);
    setQuizQuestions(
      generatePracticeQuestions(
        operation,
        numberOfDigits,
        numberOfDigits,
        numberOfQuestions,
        numberOfRows,
        isZigzag,
        includeSubtraction,
        persistNumberOfDigits,
        false
      )
    );
    setLoading(false);
    setQuizAnswers(generatePracticeAnswers(numberOfQuestions));
    start();
    setIsQuizStarted(true);
  };

  const moveQuestion = () => {
    if (currentIndex + 1 >= quizQuestions.length) {
      pause();
      submitQuiz(totalSeconds);
    } else {
      setCurrentIndex(currentIndex + 1);
      setCurrentAnswer('');
      setIsNextDisabled(true);
    }
  };

  const answerQuestion = () => {
    const currentQuestion = quizQuestions[currentIndex];
    const answers = getUpdatedAnswers(currentAnswer);
    
    // Check if answer is correct
    const correctAnswer = calculateAnswer(currentQuestion.question);
    const isDivision = operation === 'division' && includeDecimals;
    const userAnswer = isDivision ? parseFloat(currentAnswer) : parseInt(currentAnswer, 10);
    const isCorrect = !isNaN(userAnswer) && userAnswer === correctAnswer;
    
    // End timing for this problem
    endProblem(currentQuestion.questionId.toString(), isCorrect, false);
    
    setQuizAnswers(answers);
    moveQuestion();
  };

  const skipQuestion = () => {
    const currentQuestion = quizQuestions[currentIndex];
    const answers = getUpdatedAnswers(null);
    
    // End timing for this problem (skipped)
    endProblem(currentQuestion.questionId.toString(), false, true);
    
    setQuizAnswers(answers);
    moveQuestion();
  };

  return (
    <div className="tablet:gap-16 tablet:p-10 desktop:px-64 desktop:py-6 flex flex-col gap-10 desktop:gap-8 p-6">
      {!isQuizStarted ? (
        <FlashCardsForm
          operation={operation}
          numberOfQuestions={numberOfQuestions}
          setNumberOfQuestions={setNumberOfQuestions}
          numberOfDigits={numberOfDigits}
          setNumberOfDigits={setNumberOfDigits}
          isZigzag={isZigzag}
          setIsZigzag={setIsZigzag}
          speed={speed}
          setSpeed={setSpeed}
          numberOfRows={numberOfRows}
          setNumberOfRows={setNumberOfRows}
          includeSubtraction={includeSubtraction}
          setIncludeSubtraction={setIncludeSubtraction}
          persistNumberOfDigits={persistNumberOfDigits}
          setPersistNumberOfDigits={setPersistNumberOfDigits}
          audioMode={audioMode}
          setAudioMode={setAudioMode}
          audioPace={audioPace}
          setAudioPace={setAudioPace}
          showQuestion={showQuestion}
          setShowQuestion={setShowQuestion}
          handleStartQuiz={handleStartQuiz}
        />
      ) : (
        <div>
          {isQuizCompleted ? (
            <div>
              {loading ? (
                <LoadingSection loadingText="Submitting Quiz. Please wait" />
              ) : (
                <div>
                  {apiError ? (
                    <ErrorSection
                      errorMessage={apiError}
                      onClick={() => submitQuiz(totalSeconds)}
                      buttonText={MESSAGES.TRY_AGAIN}
                    />
                  ) : (
                    <ResultSection
                      result={quizResult!}
                      time={totalSeconds!}
                      totalScore={`${totalScore} of ${quizQuestions.length}`}
                      averageTime={averageTime}
                      practiceType="flashcards"
                    />
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
              <PracticeHeader
                practiceType="flashcards"
                questionNumber={currentIndex}
                noOfQuestions={quizQuestions.length}
                minutes={minutes}
                seconds={seconds}
              />
              <div className="tablet:px-4">
                <FlashCardBox
                  speed={speed}
                  quizQuestion={quizQuestions[currentIndex]}
                  answer={currentAnswer}
                  setAnswer={setCurrentAnswer}
                  setDisabled={setIsNextDisabled}
                  submitAnswer={answerQuestion}
                  audioMode={audioMode}
                  audioPace={audioPace}
                  showQuestion={showQuestion}
                  setShowQuestion={setShowQuestion}
                  allowDecimals={operation === 'division' && includeDecimals}
                />
              </div>
              <div className="tablet:gap-12 flex justify-center items-center gap-4 pt-4">
                <QuizActionButton
                  type="skip"
                  text="Skip"
                  onClick={skipQuestion}
                  disabled={currentIndex + 1 === quizQuestions.length}
                />
                {currentIndex + 1 === quizQuestions.length ? (
                  <QuizActionButton
                    type="submit"
                    text="Submit"
                    onClick={answerQuestion}
                  />
                ) : (
                  <QuizActionButton
                    type="next"
                    text="Next"
                    disabled={isNextDisabled}
                    onClick={answerQuestion}
                  />
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FlashCardsSection;
