import { FC } from 'react';

interface GameModeStepProps {
  selectedGameMode: string;
  setSelectedGameMode: (mode: string) => void;
  selectedOperation: string;
  onNext: () => void;
}

const GameModeStep: FC<GameModeStepProps> = ({
  selectedGameMode,
  setSelectedGameMode,
  selectedOperation,
  onNext
}) => {
  const gameModes = [
    // Only show flash cards for addition operations
    ...(selectedOperation === 'addition' ? [{
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-4 gap-4">
        {gameModes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => {
              setSelectedGameMode(mode.id);
              onNext(); // Automatically proceed to next step
            }}
            className={`p-4 rounded-xl font-bold transition-all duration-300 text-left ${
              selectedGameMode === mode.id
                ? 'bg-gradient-to-r from-gold to-lightGold text-black shadow-lg transform scale-105'
                : 'bg-gray-800 text-white hover:bg-gold/20 hover:text-gold'
            }`}
          >
            <div className="text-2xl mb-2">{mode.icon}</div>
            <div className="text-lg font-bold mb-2">{mode.title}</div>
            <div className="text-sm opacity-80">{mode.description}</div>
          </button>
        ))}
      </div>

    </div>
  );
};

export default GameModeStep;
