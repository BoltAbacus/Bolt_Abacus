import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import OperationSelector from '@components/molecules/OperationSelector';
import GameModeSelector from '@components/molecules/GameModeSelector';

import {
  STUDENT_FLASHCARDS,
  STUDENT_SET,
  STUDENT_TIMED,
  STUDENT_UNTIMED,
} from '@constants/routes';

export interface PracticeSectionProps {}

type NavigationStep = 'operation' | 'gameMode';

const PracticeSection: FC<PracticeSectionProps> = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<NavigationStep>('operation');
  const [selectedOperation, setSelectedOperation] = useState<string>('');

  const handleOperationSelect = (operation: string) => {
    setSelectedOperation(operation);
    setCurrentStep('gameMode');
  };

  const handleGameModeSelect = (gameMode: string) => {
    // Navigate directly to the appropriate practice page based on game mode
    switch (gameMode) {
      case 'flashcards':
        navigate(STUDENT_FLASHCARDS);
        break;
      case 'norush':
        navigate(`${STUDENT_UNTIMED}/${selectedOperation}`);
        break;
      case 'timeattack':
        navigate(`${STUDENT_TIMED}/${selectedOperation}`);
        break;
      case 'custom':
        navigate(`${STUDENT_SET}/${selectedOperation}`);
        break;
      default:
        navigate(`${STUDENT_UNTIMED}/${selectedOperation}`);
    }
  };

  const handleBackToOperation = () => {
    setCurrentStep('operation');
    setSelectedOperation('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#000000' }}>
      <div className="px-4 tablet:p-6 desktop:px-12 space-y-6 w-full max-w-6xl" style={{ backgroundColor: '#000000' }}>
        
        {/* Progress Indicator */}
        <div className="relative p-4 tablet:p-6 rounded-3xl overflow-hidden shadow-2xl">
          {/* Glassmorphism background */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-purple-500/10"></div>
          
          {/* Animated background elements */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-purple-500/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              {/* Back Button */}
              {currentStep === 'gameMode' && (
                <button
                  onClick={handleBackToOperation}
                  className="flex items-center gap-2 px-3 py-1 rounded-lg font-bold transition-all duration-300 text-sm backdrop-blur-sm border bg-white/10 text-white border-white/30 hover:bg-white/20 hover:border-white/50 hover:scale-105"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
              )}
              
              {/* Progress numbers always centered */}
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gold to-lightGold text-black font-bold flex items-center justify-center text-sm shadow-lg">
                    1
                  </div>
                  <div className="w-8 h-2 bg-gradient-to-r from-gold to-lightGold rounded-full"></div>
                  <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-sm ${
                    currentStep === 'gameMode' 
                      ? 'bg-gradient-to-r from-gold to-lightGold text-black shadow-lg' 
                      : 'bg-gray-600/50 text-gray-400'
                  }`}>
                    2
                  </div>
                </div>
              </div>
              
              {/* Spacer for balance when back button is present */}
              {currentStep === 'gameMode' && <div className="w-20"></div>}
            </div>
            
            <div className="text-center">
              <h1 className="text-3xl tablet:text-4xl font-black bg-gradient-to-r from-gold via-lightGold to-orange-500 bg-clip-text text-transparent mb-2">
                🏰 Solo Training Ground ⚔️
              </h1>
              <h2 className="text-xl tablet:text-2xl font-bold text-white/90 mb-2">
                {currentStep === 'operation' ? 'Choose Your Operation' : 'Choose Game Mode'}
              </h2>
              <p className="text-white/80 backdrop-blur-sm">
                {currentStep === 'operation' 
                  ? 'Select the mathematical operation you want to practice' 
                  : `Practice ${selectedOperation} with different challenges`
                }
              </p>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="relative p-4 tablet:p-6 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl">
          {/* Glassmorphism background */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-gold/10 via-transparent to-blue-500/10"></div>
          
          {/* Animated background elements */}
          <div className="absolute top-0 left-0 w-28 h-28 bg-gold/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            {currentStep === 'operation' && (
              <OperationSelector onOperationSelect={handleOperationSelect} />
            )}
            
            {currentStep === 'gameMode' && (
              <GameModeSelector 
                operation={selectedOperation}
                onGameModeSelect={handleGameModeSelect}
                onBack={handleBackToOperation}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeSection;
