import { FC } from 'react';

interface OperationStepProps {
  selectedOperation: string;
  setSelectedOperation: (operation: string) => void;
  onNext: () => void;
}

const OperationStep: FC<OperationStepProps> = ({
  selectedOperation,
  setSelectedOperation,
  onNext
}) => {
  const operations = [
    { id: 'addition', label: '➕➖ Addition & Subtraction', icon: '➕➖', description: 'Basic arithmetic with addition and subtraction' },
    { id: 'multiplication', label: '✖️ Multiplication', icon: '✖️', description: 'Master multiplication tables and beyond' },
    { id: 'division', label: '➗ Division', icon: '➗', description: 'Divide and conquer with division problems' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 tablet:grid-cols-3 gap-4">
        {operations.map((op) => (
          <button
            key={op.id}
            onClick={() => {
              setSelectedOperation(op.id);
              onNext(); // Automatically proceed to next step
            }}
            className={`p-6 rounded-xl font-bold transition-all duration-300 text-left ${
              selectedOperation === op.id
                ? 'bg-gradient-to-r from-gold to-lightGold text-black shadow-lg transform scale-105'
                : 'bg-gray-800 text-white hover:bg-gold/20 hover:text-gold'
            }`}
          >
            <div className="text-4xl mb-3">{op.icon}</div>
            <div className="text-lg font-bold mb-2">{op.label}</div>
            <div className="text-sm opacity-80">{op.description}</div>
          </button>
        ))}
      </div>

    </div>
  );
};

export default OperationStep;
