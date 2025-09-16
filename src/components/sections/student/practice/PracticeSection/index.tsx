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
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#000000' }}>
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-gold/20"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-gold/5 to-transparent"></div>
      
      {/* Floating background elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gold/10 rounded-full blur-3xl"></div>
      <div className="absolute top-40 right-20 w-24 h-24 bg-purple/10 rounded-full blur-2xl"></div>
      <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-blue/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-gold/10 rounded-full blur-2xl"></div>
      
      <div className="relative z-10 space-y-3 tablet:space-y-6 min-h-screen p-2 tablet:p-4">
        {/* Header */}
        <div className="transition-colors text-white p-3 tablet:p-8 rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.65)] relative overflow-hidden" style={{ backgroundColor: '#161618' }}>
          <div className="relative z-10 text-center">
            <h1 className="text-xl tablet:text-5xl font-black bg-gradient-to-r from-gold via-yellow-300 to-gold bg-clip-text text-transparent mb-2 tablet:mb-4">
              🏰 SOLO TRAINING GROUND ⚔️
            </h1>
            <div className="flex flex-col tablet:flex-row justify-center items-center gap-1 tablet:gap-4 mb-3 tablet:mb-6">
              <div className="backdrop-blur-sm bg-gold/80 text-black px-2 tablet:px-4 py-1 tablet:py-2 rounded-full font-bold text-xs tablet:text-base border border-gold/50 shadow-lg hover:shadow-gold/50 transition-all duration-300 hover:scale-105">
                🎯 MASTER YOUR SKILLS
              </div>
              <div className="backdrop-blur-sm bg-purple/80 text-white px-2 tablet:px-4 py-1 tablet:py-2 rounded-full font-bold text-xs tablet:text-base border border-purple/50 shadow-lg hover:shadow-purple/50 transition-all duration-300 hover:scale-105">
                ⚡ PRACTICE MODES
              </div>
            </div>
            <p className="text-white/90 text-xs tablet:text-lg max-w-3xl mx-auto backdrop-blur-sm">
              Practice and perfect your math skills with various training modes! Choose your operation and challenge yourself.
              <span className="font-bold text-gold"> Ready to train? 🚀</span>
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="relative p-3 tablet:p-6 rounded-3xl overflow-hidden shadow-2xl">
          {/* Glassmorphism background */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-purple-500/10"></div>
          
          {/* Animated background elements */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-purple-500/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3 tablet:mb-4">
              {/* Back Button at complete left */}
              <button
                onClick={handleBackToOperation}
                disabled={currentStep === 'operation'}
                className={`flex items-center gap-1 tablet:gap-2 px-2 tablet:px-3 py-1 rounded-lg font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-xs tablet:text-sm backdrop-blur-sm border ${
                  currentStep === 'operation'
                    ? 'bg-gray-600/50 text-gray-400 border-gray-500/50'
                    : 'bg-white/10 text-white border-white/30 hover:bg-white/20 hover:border-white/50 hover:scale-105'
                }`}
              >
                <svg className="w-3 h-3 tablet:w-4 tablet:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden tablet:inline">Back</span>
              </button>
              
              {/* Progress numbers centered */}
              <div className="flex items-center">
                {['operation', 'gameMode'].map((step, index) => (
                  <div key={step} className="flex items-center">
                    <div className="relative">
                       {/* Glass circle behind */}
                       <div className="absolute inset-0 w-6 h-6 tablet:w-8 tablet:h-8 rounded-full backdrop-blur-sm bg-white/20"></div>
                       {/* Active circle on top */}
                       <div className={`relative w-6 h-6 tablet:w-8 tablet:h-8 rounded-full flex items-center justify-center text-xs tablet:text-sm font-bold z-10 backdrop-blur-sm transition-all duration-500 ${
                         currentStep === step 
                           ? 'bg-gold/80 text-black shadow-lg shadow-gold/50' 
                           : ['operation', 'gameMode'].indexOf(currentStep) > index
                             ? 'bg-green-500/80 text-white shadow-lg shadow-green-500/50'
                             : 'bg-transparent text-white/60'
                       }`}>
                        {index + 1}
                      </div>
                    </div>
                    {index < 1 && (
                      <div className={`w-8 tablet:w-12 h-0.5 mx-1 backdrop-blur-sm rounded-full transition-all duration-500 ${
                        ['operation', 'gameMode'].indexOf(currentStep) > index
                          ? 'bg-gradient-to-r from-green-400 to-green-500 shadow-lg shadow-green-500/50'
                          : 'bg-white/20'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              
              {/* Empty space on the right for balance */}
              <div className="w-8 tablet:w-16"></div>
            </div>
            
            <div className="text-center">
              <h2 className="text-lg tablet:text-3xl font-black bg-gradient-to-r from-gold via-lightGold to-orange-500 bg-clip-text text-transparent mb-1 tablet:mb-2">
                {currentStep === 'operation' ? '📚 CHOOSE YOUR OPERATION' : '🎯 CHOOSE YOUR GAME MODE'}
              </h2>
              <p className="text-white/80 backdrop-blur-sm text-xs tablet:text-base">
                {currentStep === 'operation' 
                  ? 'Select the mathematical operation you want to practice' 
                  : `Practice ${selectedOperation} with different challenges`
                }
              </p>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="relative p-3 tablet:p-6 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl">
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
