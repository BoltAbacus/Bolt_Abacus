import { FC, useState, useEffect } from 'react';
import { useStopwatch } from 'react-timer-hook';
import { isAxiosError } from 'axios';

import QuizActionButton from '@components/atoms/QuizActionButton';
import PracticeHeader from '@components/molecules/PracticeHeader';
import UnTimedPracticeForm from '@components/organisms/UnTimedPracticeForm';
import QuizBox from '@components/organisms/QuizBox';
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
import { useProblemTimer } from '@hooks/useProblemTimer';

export interface UnTimedPracticeSectionProps {
  operation: 'addition' | 'multiplication' | 'division';
}

const UnTimedPracticeSection: FC<UnTimedPracticeSectionProps> = ({
  operation,
}) => {
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
  const [numberOfDigitsLeft, setNumberOfDigitsLeft] = useState(1);
  const [numberOfDigitsRight, setNumberOfDigitsRight] = useState(1);
  const [numberOfRows, setNumberOfRows] = useState(2);
  const [isZigzag, setIsZigzag] = useState(false);
  const [includeSubtraction, setIncludeSubtraction] = useState(operation === 'addition');
  const [persistNumberOfDigits, setPersistNumberOfDigits] = useState(false);
  const [includeDecimals, setIncludeDecimals] = useState(false);
  const [audioMode, setAudioMode] = useState(false);
  const [audioPace, setAudioPace] = useState('normal');
  const [showQuestion, setShowQuestion] = useState(true);

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
    let answer;
    if (operation === 'division' && includeDecimals) {
      answer = parseFloat(ans!).toFixed(2);
      answer = parseFloat(answer);
    } else {
      answer = parseInt(ans!, 10);
    }
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
        'untimed',
        operation,
        numberOfDigitsLeft,
        numberOfQuestions,
        numberOfRows,
        isZigzag,
        includeSubtraction,
        persistNumberOfDigits,
        includeDecimals,
        score,
        totalSeconds,
        parseFloat(avg.toFixed(2)),
        authToken!,
        problemTimes // Include detailed problem times
      );
      logActivity({
        type: 'practice',
        title: `UnTimed Practice (${operation}) completed with score ${score}`,
        xp: undefined,
        meta: { operation, numberOfDigitsLeft, numberOfQuestions, problemTimes }
      });
      // Notify other pages (like Progress) to refresh weekly goals/stats immediately
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
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async () => {
    // Save practice mode settings to localStorage
    const practiceSettings = {
      numberOfDigitsLeft,
      numberOfDigitsRight,
      isZigzag,
      numberOfRows,
      includeSubtraction,
      persistNumberOfDigits,
      includeDecimals,
      audioMode,
      audioPace,
      showQuestion,
      operation,
      game_mode: 'untimed',
      number_of_digits: numberOfDigitsLeft,
      time_per_question: 0, // No time limit for untimed
      number_of_questions: numberOfQuestions,
      difficulty_level: 'medium'
    };
    
    try {
      localStorage.setItem('practiceModeSettings', JSON.stringify(practiceSettings));
    } catch (error) {
      console.log('Error saving practice mode settings:', error);
    }

    setLoading(true);
    await setQuizQuestions(
      generatePracticeQuestions(
        operation,
        numberOfDigitsLeft,
        numberOfDigitsRight,
        numberOfQuestions,
        numberOfRows,
        isZigzag,
        includeSubtraction,
        persistNumberOfDigits,
        includeDecimals
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
    let userAnswer;
    if (operation === 'division' && includeDecimals) {
      userAnswer = parseFloat(currentAnswer);
    } else {
      userAnswer = parseInt(currentAnswer, 10);
    }
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
        <UnTimedPracticeForm
          operation={operation}
          numberOfQuestions={numberOfQuestions}
          setNumberOfQuestions={setNumberOfQuestions}
          numberOfDigitsLeft={numberOfDigitsLeft}
          setNumberOfDigitsLeft={setNumberOfDigitsLeft}
          numberOfDigitsRight={numberOfDigitsRight}
          setNumberOfDigitsRight={setNumberOfDigitsRight}
          numberOfRows={numberOfRows}
          setNumberOfRows={setNumberOfRows}
          isZigzag={isZigzag}
          setIsZigzag={setIsZigzag}
          includeSubtraction={includeSubtraction}
          setIncludeSubtraction={setIncludeSubtraction}
          persistNumberOfDigits={persistNumberOfDigits}
          setPersistNumberOfDigits={setPersistNumberOfDigits}
          includeDecimals={includeDecimals}
          setIncludeDecimals={setIncludeDecimals}
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
                      practiceType="untimed"
                    />
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
              <PracticeHeader
                practiceType="untimed"
                questionNumber={currentIndex}
                noOfQuestions={quizQuestions.length}
                minutes={minutes}
                seconds={seconds}
              />
              <div className="tablet:px-4 flex justify-center">
                <div className="w-full max-w-4xl">
                  <QuizBox
                    quizQuestion={quizQuestions[currentIndex]}
                    answer={currentAnswer}
                    setAnswer={setCurrentAnswer}
                    setDisabled={setIsNextDisabled}
                    submitAnswer={answerQuestion}
                    operation={operation}
                    includeDecimals={includeDecimals}
                    audioMode={audioMode}
                    audioPace={audioPace}
                    showQuestion={showQuestion}
                    setShowQuestion={setShowQuestion}
                  />
                </div>
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

export default UnTimedPracticeSection;
