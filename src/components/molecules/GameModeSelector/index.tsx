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
  const gameModes = [
    // Only show flash cards for addition operations
    ...(operation === 'addition' ? [{
      id: 'flashcards',
      title: 'Flash Cards',
      description: 'Quick memory training with instant feedback!',
      icon: '⚡',
      color: 'red'
    }] : []),
    {
      id: 'norush',
      title: 'No Rush Mastery',
      description: 'Learn at your own pace without pressure.',
      icon: '🐌',
      color: 'blue'
    },
    {
      id: 'timeattack',
      title: 'Time Attack',
      description: 'Race against the clock in this fast-paced challenge!',
      icon: '⏰',
      color: 'green'
    },
    {
      id: 'custom',
      title: 'Custom Challenge',
      description: 'Create your own rules and difficulty settings.',
      icon: '⚙️',
      color: 'pink'
    }
  ];

  return (
    <div className="space-y-4 tablet:space-y-6">
      <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-4 gap-3 tablet:gap-4">
        {gameModes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onGameModeSelect(mode.id)}
            className="p-3 tablet:p-4 rounded-xl font-bold transition-all duration-300 text-left bg-gray-800 text-white hover:bg-gold/20 hover:text-gold"
          >
            <div className="text-xl tablet:text-2xl mb-1 tablet:mb-2">{mode.icon}</div>
            <div className="text-base tablet:text-lg font-bold mb-1 tablet:mb-2">{mode.title}</div>
            <div className="text-xs tablet:text-sm opacity-80">{mode.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GameModeSelector;
