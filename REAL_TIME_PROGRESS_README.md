# Real-Time Progress Tracking Implementation

This document describes the implementation of real-time progress tracking for the Bolt Abacus flashcard practice system.

## Overview

The real-time progress tracking system allows students to:
- Track their progress in real-time during practice sessions
- See live updates of accuracy, time, and completion percentage
- Have their progress automatically saved to the backend
- Resume practice sessions if interrupted

## Architecture

### Backend Components

#### 1. Database Model
- **PracticeQuestions Model**: Stores practice session data including:
  - User ID, practice type, operation
  - Number of questions, digits, rows
  - Score, total time, average time
  - Various practice settings (zigzag, subtraction, etc.)

#### 2. API Endpoints

##### UpdatePracticeProgress
- **URL**: `/updatePracticeProgress/`
- **Method**: POST
- **Purpose**: Updates progress in real-time during practice
- **Parameters**:
  - `practiceType`: Type of practice (flashcards, timed, etc.)
  - `operation`: Math operation (addition, multiplication, division)
  - `currentQuestion`: Current question number
  - `totalQuestions`: Total number of questions
  - `correctAnswers`: Number of correct answers
  - `incorrectAnswers`: Number of incorrect answers
  - `timeElapsed`: Time elapsed in seconds
  - `isCompleted`: Whether practice is completed
  - Practice settings (numberOfDigits, numberOfRows, etc.)

##### GetPracticeProgress
- **URL**: `/getPracticeProgress/`
- **Method**: POST
- **Purpose**: Retrieves the most recent practice progress for a user
- **Parameters**:
  - `practiceType`: Type of practice
  - `operation`: Math operation

### Frontend Components

#### 1. Custom Hook: `usePracticeProgress`
- **Location**: `src/hooks/usePracticeProgress.ts`
- **Purpose**: Manages practice progress state and provides methods to update progress
- **Features**:
  - Real-time timer tracking
  - Auto-save every 5 seconds
  - Progress calculation (percentage, accuracy)
  - Automatic completion detection

#### 2. Context Provider: `PracticeProvider`
- **Location**: `src/contexts/PracticeContext.tsx`
- **Purpose**: Provides practice progress state to all child components
- **Features**:
  - Shared state across components
  - Type-safe context usage
  - Automatic cleanup

#### 3. Progress Tracker Component: `PracticeProgressTracker`
- **Location**: `src/components/organisms/PracticeProgressTracker/index.tsx`
- **Purpose**: Displays real-time progress information
- **Features**:
  - Visual progress bar
  - Accuracy and time statistics
  - Status indicators
  - Control buttons (start, stop, reset)

#### 4. Progress Update Button: `ProgressUpdateButton`
- **Location**: `src/components/atoms/ProgressUpdateButton/index.tsx`
- **Purpose**: Button component that updates progress when clicked
- **Features**:
  - Integrates with practice context
  - Supports custom styling
  - Handles correct/incorrect answers

#### 5. Flash Card Practice Component: `FlashCardPractice`
- **Location**: `src/components/organisms/FlashCardPractice/index.tsx`
- **Purpose**: Demonstrates the flashcard practice with real-time tracking
- **Features**:
  - Question generation
  - Auto-advancing based on speed
  - Answer validation
  - Progress integration

## Usage

### 1. Setting up Progress Tracking

```tsx
import { PracticeProvider } from '@contexts/PracticeContext';

<PracticeProvider
  operation="addition"
  numberOfQuestions={10}
  numberOfDigits={2}
  numberOfRows={2}
  isZigzag={false}
  includeSubtraction={false}
  persistNumberOfDigits={false}
  audioMode={false}
  audioPace="normal"
  showQuestion={true}
>
  {/* Your practice components */}
</PracticeProvider>
```

### 2. Using Progress Context

```tsx
import { usePracticeContext } from '@contexts/PracticeContext';

const MyComponent = () => {
  const { progress, updateProgress, startTracking } = usePracticeContext();
  
  const handleCorrectAnswer = () => {
    updateProgress(true); // Correct answer
  };
  
  const handleIncorrectAnswer = () => {
    updateProgress(false); // Incorrect answer
  };
  
  return (
    <div>
      <p>Progress: {progress.progressPercentage.toFixed(1)}%</p>
      <p>Accuracy: {progress.accuracyPercentage.toFixed(1)}%</p>
    </div>
  );
};
```

### 3. Using Progress Update Button

```tsx
import ProgressUpdateButton from '@components/atoms/ProgressUpdateButton';

<ProgressUpdateButton
  isCorrect={true}
  className="bg-green text-white px-4 py-2 rounded"
  onClick={() => console.log('Correct answer!')}
>
  ✅ Correct
</ProgressUpdateButton>
```

## Features

### Real-Time Updates
- Progress updates every second
- Visual feedback with progress bars
- Live accuracy and time tracking

### Auto-Save
- Progress saved every 5 seconds
- Immediate save on important milestones
- Resume capability if session is interrupted

### Visual Indicators
- Progress percentage with animated bars
- Accuracy statistics with color coding
- Time tracking with MM:SS format
- Status indicators (Ready, Live Tracking, Completed)

### Data Persistence
- All progress saved to database
- Practice history maintained
- Performance analytics available

## API Response Examples

### UpdatePracticeProgress Response
```json
{
  "message": "Progress updated successfully",
  "progress": {
    "currentQuestion": 5,
    "totalQuestions": 10,
    "progressPercentage": 50.0,
    "correctAnswers": 4,
    "incorrectAnswers": 1,
    "accuracyPercentage": 80.0,
    "timeElapsed": 120,
    "isCompleted": false
  }
}
```

### GetPracticeProgress Response
```json
{
  "practiceProgress": {
    "practiceQuestionId": 123,
    "practiceType": "flashcards",
    "operation": "addition",
    "score": 8,
    "totalTime": 300,
    "averageTime": 30.0,
    "numberOfQuestions": 10,
    "numberOfDigits": 2,
    "numberOfRows": 2,
    "zigZag": false,
    "includeSubtraction": false,
    "persistNumberOfDigits": false
  }
}
```

## Testing

### Backend Testing
Run the test script to verify endpoints:
```bash
python test_progress_endpoints.py
```

### Frontend Testing
1. Start the development server
2. Navigate to the practice page
3. Configure flashcard settings
4. Click "Start Practice"
5. Verify real-time progress updates

## Future Enhancements

1. **WebSocket Integration**: Real-time updates without polling
2. **Offline Support**: Local storage with sync when online
3. **Analytics Dashboard**: Detailed performance insights
4. **Achievement System**: Badges and rewards based on progress
5. **Social Features**: Share progress with friends/teachers
6. **Adaptive Difficulty**: Adjust question difficulty based on performance

## Troubleshooting

### Common Issues

1. **Progress not updating**: Check if user is authenticated
2. **Auto-save not working**: Verify network connection
3. **Timer not accurate**: Check for JavaScript errors
4. **Context not available**: Ensure component is wrapped in PracticeProvider

### Debug Mode
Enable debug logging by setting:
```javascript
localStorage.setItem('debug', 'practice-progress');
```

## Security Considerations

1. **Authentication**: All endpoints require valid auth token
2. **Data Validation**: Input validation on all parameters
3. **Rate Limiting**: Consider implementing rate limiting
4. **Data Privacy**: User data is isolated by organization

## Performance Considerations

1. **Debounced Updates**: Progress updates are debounced to prevent spam
2. **Efficient Queries**: Database queries are optimized
3. **Memory Management**: Proper cleanup of intervals and timers
4. **Network Optimization**: Minimal data transfer for updates
