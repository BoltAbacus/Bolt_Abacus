import { FC } from 'react';

export interface GameModeSelectorProps {
  operation: string;
  onGameModeSelect: (gameMode: string) => void;
  onBack: () => void;
}

const GameModeSelector: FC<GameModeSelectorProps> = ({ 
  operation, 
  onGameModeSelect, 
  onBack 
}) => {
  const getGameModes = (operation: string) => {
    const baseModes = [
      {
        id: 'norush',
        title: 'No Rush Mastery',
        description: 'Learn at your own pace without pressure',
        icon: '🐌',
        gradient: 'from-blue-500/20 to-cyan-500/20',
        borderColor: 'border-blue-500/30',
        iconColor: 'text-blue-400'
      },
      {
        id: 'timeattack',
        title: 'Time Attack',
        description: 'Race against the clock in this fast-paced challenge!',
        icon: '⏰',
        gradient: 'from-red-500/20 to-pink-500/20',
        borderColor: 'border-red-500/30',
        iconColor: 'text-red-400'
      },
      {
        id: 'custom',
        title: 'Custom Challenge',
        description: 'Create your own rules and difficulty settings',
        icon: '⚙️',
        gradient: 'from-purple-500/20 to-violet-500/20',
        borderColor: 'border-purple-500/30',
        iconColor: 'text-purple-400'
      }
    ];

    // Add flashcards only for addition
    if (operation === 'addition') {
      baseModes.unshift({
        id: 'flashcards',
        title: 'Flash Cards',
        description: 'Quick memory training with instant feedback!',
        icon: '⚡',
        gradient: 'from-yellow-500/20 to-orange-500/20',
        borderColor: 'border-yellow-500/30',
        iconColor: 'text-yellow-400'
      });
    }

    return baseModes;
  };

  const gameModes = getGameModes(operation);
  const operationSymbols = {
    addition: '+',
    subtraction: '−',
    multiplication: '×',
    division: '÷'
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-6">
        {gameModes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onGameModeSelect(mode.id)}
            className="group relative p-6 rounded-3xl transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden"
            style={{ 
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              backdropFilter: 'blur(30px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            }}
          >
            {/* Enhanced Glass overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-purple-500/10 to-cyan-500/10 rounded-3xl" />
            
            {/* Hover glass reflection */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Animated rainbow gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" />
            
            {/* Subtle rainbow border effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-gold/20 via-purple-500/20 via-cyan-500/20 to-gold/20 opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
            
            {/* Content */}
            <div className="relative z-10 text-center">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">
                {mode.icon}
              </div>
              
              <h3 className="text-xl font-semibold mb-2 drop-shadow-md" style={{ color: '#ffffff' }}>
                {mode.title}
              </h3>
              <p className="text-sm leading-relaxed drop-shadow-sm" style={{ color: '#818181' }}>
                {mode.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GameModeSelector;
