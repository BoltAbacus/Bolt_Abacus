import {
  QuestionResult,
  QuizAnswer,
  QuizQuestion,
} from '@interfaces/apis/student';

function generateRandomNumber(min: number, max: number): number {
  let num = Math.floor(Math.random() * (max - min + 1)) + min;

  while (num === 0) {
    num = Math.floor(Math.random() * (max - min + 1)) + min;
  }

  return num;
}

export const generatePracticeQuestions = (
  operation: string,
  numberOfDigitsLeft: number,
  numberOfDigitsRight: number,
  numberOfQuestions: number,
  numberOfRows: number,
  zigZag: boolean,
  includeSubtraction: boolean,
  persistNumberOfDigits: boolean,
  includeDecimals: boolean
): QuizQuestion[] => {
  const questions: QuizQuestion[] = [];

  for (let i = 0; i < numberOfQuestions; i += 1) {
    let numbers: number[] = [];

    if (operation === 'addition') {
      for (let j = 0; j < numberOfRows; j += 1) {
        const currentMin = zigZag ? 1 : 10 ** (numberOfDigitsLeft - 1);
        const currentMax = zigZag
          ? 10 ** generateRandomNumber(1, numberOfDigitsLeft) - 1
          : 10 ** numberOfDigitsLeft - 1;
        numbers.push(generateRandomNumber(currentMin, currentMax));
      }

      if (includeSubtraction) {
        // Ensure first number is always positive and final answer is always positive
        let attempts = 0;
        const maxAttempts = 100; // Prevent infinite loops
        let finalSum = 0;
        
        do {
          // Reset numbers to positive values
          numbers = [];
          for (let j = 0; j < numberOfRows; j += 1) {
            const currentMin = zigZag ? 1 : 10 ** (numberOfDigitsLeft - 1);
            const currentMax = zigZag
              ? 10 ** generateRandomNumber(1, numberOfDigitsLeft) - 1
              : 10 ** numberOfDigitsLeft - 1;
            numbers.push(generateRandomNumber(currentMin, currentMax));
          }
          
          // First number is always positive (never change it)
          // Apply subtraction randomly to other numbers but ensure final sum is always positive
          finalSum = numbers[0]; // Start with first number (always positive)
          
          for (let j = 1; j < numbers.length; j += 1) {
            if (Math.random() < 0.5 && finalSum - numbers[j] > 0) {
              // Only make negative if it won't make final sum negative
              numbers[j] *= -1;
              finalSum += numbers[j];
            } else {
              // Keep positive
              finalSum += numbers[j];
            }
          }
          
          attempts++;
        } while (finalSum <= 0 && attempts < maxAttempts);
        
        // If we still couldn't find a valid combination, use a more conservative approach
        if (attempts >= maxAttempts) {
          numbers = [];
          for (let j = 0; j < numberOfRows; j += 1) {
            const currentMin = zigZag ? 1 : 10 ** (numberOfDigitsLeft - 1);
            const currentMax = zigZag
              ? 10 ** generateRandomNumber(1, numberOfDigitsLeft) - 1
              : 10 ** numberOfDigitsLeft - 1;
            numbers.push(generateRandomNumber(currentMin, currentMax));
          }
          
          // Conservative approach: ensure first number is large enough to handle all subtractions
          finalSum = numbers[0]; // First number stays positive
          
          for (let j = 1; j < numbers.length; j += 1) {
            if (Math.random() < 0.5 && finalSum - numbers[j] > 0) {
              numbers[j] *= -1;
              finalSum += numbers[j];
            } else {
              finalSum += numbers[j];
            }
          }
        }
      }

      if (persistNumberOfDigits) {
        let sum = numbers.reduce((a, b) => a + b, 0);
        while (Math.abs(sum).toString().length !== numberOfDigitsLeft) {
          numbers = [];
          for (let j = 0; j < numberOfRows; j += 1) {
            const currentMin = zigZag ? 1 : 10 ** (numberOfDigitsLeft - 1);
            const currentMax = zigZag
              ? 10 ** generateRandomNumber(1, numberOfDigitsLeft) - 1
              : 10 ** numberOfDigitsRight - 1;
            numbers.push(generateRandomNumber(currentMin, currentMax));
          }
          
          // Re-apply subtraction logic if needed
          if (includeSubtraction) {
            let attempts = 0;
            const maxAttempts = 100;
            
            do {
              const tempNumbers = [...numbers];
              let cumulativeSum = tempNumbers[0]; // Start with first number
              
              for (let j = 1; j < tempNumbers.length; j += 1) {
                if (Math.random() < 0.5 && cumulativeSum - tempNumbers[j] > 0) {
                  // Only make negative if it won't make cumulative sum negative
                  tempNumbers[j] *= -1;
                  cumulativeSum += tempNumbers[j];
                } else {
                  // Keep positive
                  cumulativeSum += tempNumbers[j];
                }
              }
              
              if (cumulativeSum > 0) {
                numbers = tempNumbers;
                break;
              }
              
              attempts++;
            } while (attempts < maxAttempts);
          }
          
          sum = numbers.reduce((a, b) => a + b, 0);
        }
      }
    } else if (operation === 'multiplication') {
      const leftMin = 10 ** (numberOfDigitsLeft - 1);
      const leftMax = 10 ** numberOfDigitsLeft - 1;
      const rightMin = 10 ** (numberOfDigitsRight - 1);
      const rightMax = 10 ** numberOfDigitsRight - 1;

      numbers.push(generateRandomNumber(leftMin, leftMax));
      numbers.push(generateRandomNumber(rightMin, rightMax));
    } else if (operation === 'division') {
      const leftMin = 10 ** (numberOfDigitsLeft - 1);
      const leftMax = 10 ** numberOfDigitsLeft - 1;
      const rightMin = 10 ** (numberOfDigitsRight - 1);
      const rightMax = 10 ** numberOfDigitsRight - 1;

      let num1 = generateRandomNumber(leftMin, leftMax);
      let num2 = generateRandomNumber(rightMin, rightMax);

      if (num1 < num2) {
        [num1, num2] = [num2, num1];
      }

      if (!includeDecimals) {
        while (num1 % num2 !== 0) {
          num1 = generateRandomNumber(leftMin, leftMax);
          num2 = generateRandomNumber(rightMin, rightMax);

          if (num1 < num2) {
            [num1, num2] = [num2, num1];
          }
        }
      }

      numbers = [num1, num2];
    }

    const question: QuizQuestion = {
      questionId: i + 1,
      question: {
        operator:
          operation === 'addition'
            ? '+'
            : operation === 'multiplication'
              ? '*'
              : '/',
        numbers,
      },
    };
    questions.push(question);
  }

  return questions;
};

export const generatePracticeAnswers = (
  numberOfQuestions: number
): QuizAnswer[] => {
  const answers: QuizAnswer[] = [];

  for (let i = 0; i < numberOfQuestions; i += 1) {
    answers.push({
      questionId: i + 1,
      answer: null,
    });
  }
  return answers;
};

export const generateResult = (
  questions: QuizQuestion[],
  answers: QuizAnswer[]
) => {
  const result: QuestionResult[] = [];

  for (let i = 0; i < questions.length; i += 1) {
    const { questionId } = questions[i];
    const { question } = questions[i];

    const answer = answers.find((a) => a.questionId === questionId)!;

    let questionString = '';
    let currentAnswer = question.numbers[0];

    for (let j = 0; j < question.numbers.length; j += 1) {
      questionString += question.numbers[j];
      if (j < question.numbers.length - 1) {
        questionString += ` ${question.operator} `;
      }
    }

    for (let j = 1; j < question.numbers.length; j += 1) {
      if (question.operator === '+') {
        currentAnswer += question.numbers[j];
      } else if (question.operator === '*') {
        currentAnswer *= question.numbers[j];
      } else if (question.operator === '/') {
        currentAnswer /= question.numbers[j];
      }
    }

    result.push({
      question: questionString,
      answer: answer.answer,
      verdict: currentAnswer.toFixed(2) === answer.answer?.toFixed(2),
    });
  }

  return { result, totalScore: result.filter((r) => r.verdict).length };
};

export const generateTimedResult = (
  questions: QuizQuestion[],
  answers: QuizAnswer[]
) => {
  const result: QuestionResult[] = [];

  for (let i = 0; i < answers.length; i += 1) {
    const { questionId } = answers[i];
    const answer = answers[i];

    const question = questions.find((q) => q.questionId === questionId)!;

    let questionString = '';
    let currentAnswer = question.question.numbers[0];

    for (let j = 0; j < question.question.numbers.length; j += 1) {
      questionString += question.question.numbers[j];
      if (j < question.question.numbers.length - 1) {
        questionString += ` ${question.question.operator} `;
      }
    }

    for (let j = 1; j < question.question.numbers.length; j += 1) {
      if (question.question.operator === '+') {
        currentAnswer += question.question.numbers[j];
      } else if (question.question.operator === '*') {
        currentAnswer *= question.question.numbers[j];
      } else if (question.question.operator === '/') {
        currentAnswer /= question.question.numbers[j];
      }
    }

    result.push({
      question: questionString,
      answer: answer.answer,
      verdict: currentAnswer.toFixed(2) === answer.answer?.toFixed(2),
    });
  }

  return { result, totalScore: result.filter((r) => r.verdict).length };
};

// PvP Question Generation using Practice Mode Settings
export interface PvPQuestion {
  question_id: number;
  operands: number[];
  operator: string;
  correct_answer: number;
  question_type: string;
}

export const generatePvPQuestions = (
  operation: string,
  numberOfDigitsLeft: number,
  numberOfDigitsRight: number,
  numberOfQuestions: number,
  numberOfRows: number,
  isZigzag: boolean,
  includeSubtraction: boolean,
  persistNumberOfDigits: boolean,
  includeDecimals: boolean
): PvPQuestion[] => {
  const questions: PvPQuestion[] = [];

  for (let i = 0; i < numberOfQuestions; i += 1) {
    let numbers: number[] = [];

    if (operation === 'addition') {
      for (let j = 0; j < numberOfRows; j += 1) {
        const currentMin = isZigzag ? 1 : 10 ** (numberOfDigitsLeft - 1);
        const currentMax = isZigzag
          ? 10 ** generateRandomNumber(1, numberOfDigitsLeft) - 1
          : 10 ** numberOfDigitsLeft - 1;
        numbers.push(generateRandomNumber(currentMin, currentMax));
      }

      if (includeSubtraction) {
        // Ensure first number is always positive and final answer is always positive
        let attempts = 0;
        const maxAttempts = 100; // Prevent infinite loops
        let finalSum = 0;
        
        do {
          // Reset numbers to positive values
          numbers = [];
          for (let j = 0; j < numberOfRows; j += 1) {
            const currentMin = isZigzag ? 1 : 10 ** (numberOfDigitsLeft - 1);
            const currentMax = isZigzag
              ? 10 ** generateRandomNumber(1, numberOfDigitsLeft) - 1
              : 10 ** numberOfDigitsLeft - 1;
            numbers.push(generateRandomNumber(currentMin, currentMax));
          }
          
          // First number is always positive (never change it)
          // Apply subtraction randomly to other numbers but ensure final sum is always positive
          finalSum = numbers[0]; // Start with first number (always positive)
          
          for (let j = 1; j < numbers.length; j += 1) {
            if (Math.random() < 0.5 && finalSum - numbers[j] > 0) {
              // Only make negative if it won't make final sum negative
              numbers[j] *= -1;
              finalSum += numbers[j];
            } else {
              // Keep positive
              finalSum += numbers[j];
            }
          }
          
          attempts++;
        } while (finalSum <= 0 && attempts < maxAttempts);
        
        // If we still couldn't find a valid combination, use a more conservative approach
        if (attempts >= maxAttempts) {
          numbers = [];
          for (let j = 0; j < numberOfRows; j += 1) {
            const currentMin = isZigzag ? 1 : 10 ** (numberOfDigitsLeft - 1);
            const currentMax = isZigzag
              ? 10 ** generateRandomNumber(1, numberOfDigitsLeft) - 1
              : 10 ** numberOfDigitsLeft - 1;
            numbers.push(generateRandomNumber(currentMin, currentMax));
          }
          
          // Conservative approach: ensure first number is large enough to handle all subtractions
          finalSum = numbers[0]; // First number stays positive
          
          for (let j = 1; j < numbers.length; j += 1) {
            if (Math.random() < 0.5 && finalSum - numbers[j] > 0) {
              numbers[j] *= -1;
              finalSum += numbers[j];
            } else {
              finalSum += numbers[j];
            }
          }
        }
      }

      if (persistNumberOfDigits) {
        let sum = numbers.reduce((a, b) => a + b, 0);
        while (Math.abs(sum).toString().length !== numberOfDigitsLeft) {
          numbers = [];
          for (let j = 0; j < numberOfRows; j += 1) {
            const currentMin = isZigzag ? 1 : 10 ** (numberOfDigitsLeft - 1);
            const currentMax = isZigzag
              ? 10 ** generateRandomNumber(1, numberOfDigitsLeft) - 1
              : 10 ** numberOfDigitsRight - 1;
            numbers.push(generateRandomNumber(currentMin, currentMax));
          }
          
          // Re-apply subtraction logic if needed
          if (includeSubtraction) {
            let attempts = 0;
            const maxAttempts = 100;
            
            do {
              const tempNumbers = [...numbers];
              let cumulativeSum = tempNumbers[0]; // Start with first number
              
              for (let j = 1; j < tempNumbers.length; j += 1) {
                if (Math.random() < 0.5 && cumulativeSum - tempNumbers[j] > 0) {
                  // Only make negative if it won't make cumulative sum negative
                  tempNumbers[j] *= -1;
                  cumulativeSum += tempNumbers[j];
                } else {
                  // Keep positive
                  cumulativeSum += tempNumbers[j];
                }
              }
              
              if (cumulativeSum > 0) {
                numbers = tempNumbers;
                break;
              }
              
              attempts++;
            } while (attempts < maxAttempts);
          }
          
          sum = numbers.reduce((a, b) => a + b, 0);
        }
      }
    } else if (operation === 'multiplication') {
      const leftMin = 10 ** (numberOfDigitsLeft - 1);
      const leftMax = 10 ** numberOfDigitsLeft - 1;
      const rightMin = 10 ** (numberOfDigitsRight - 1);
      const rightMax = 10 ** numberOfDigitsRight - 1;

      numbers.push(generateRandomNumber(leftMin, leftMax));
      numbers.push(generateRandomNumber(rightMin, rightMax));
    } else if (operation === 'division') {
      const leftMin = 10 ** (numberOfDigitsLeft - 1);
      const leftMax = 10 ** numberOfDigitsLeft - 1;
      const rightMin = 10 ** (numberOfDigitsRight - 1);
      const rightMax = 10 ** numberOfDigitsRight - 1;

      let num1 = generateRandomNumber(leftMin, leftMax);
      let num2 = generateRandomNumber(rightMin, rightMax);

      if (num1 < num2) {
        [num1, num2] = [num2, num1];
      }

      if (!includeDecimals) {
        while (num1 % num2 !== 0) {
          num1 = generateRandomNumber(leftMin, leftMax);
          num2 = generateRandomNumber(rightMin, rightMax);

          if (num1 < num2) {
            [num1, num2] = [num2, num1];
          }
        }
      }

      numbers = [num1, num2];
    }

    // Calculate correct answer
    let correctAnswer = numbers[0];
    const operator = operation === 'addition' ? '+' : operation === 'multiplication' ? '*' : '/';

    for (let j = 1; j < numbers.length; j += 1) {
      if (operator === '+') {
        correctAnswer += numbers[j];
      } else if (operator === '*') {
        correctAnswer *= numbers[j];
      } else if (operator === '/') {
        correctAnswer /= numbers[j];
      }
    }

    // Round to 2 decimal places for division with decimals
    if (operation === 'division' && includeDecimals) {
      correctAnswer = Math.round(correctAnswer * 100) / 100;
    }

    const question: PvPQuestion = {
      question_id: i + 1,
      operands: numbers,
      operator,
      correct_answer: correctAnswer,
      question_type: 'basic'
    };

    questions.push(question);
  }

  return questions;
};