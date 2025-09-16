import { FC } from 'react';

export interface OperationSelectorProps {
  onOperationSelect: (operation: string) => void;
}

const OperationSelector: FC<OperationSelectorProps> = ({ onOperationSelect }) => {
  const operations = [
    { id: 'addition', label: '➕➖ Addition & Subtraction', icon: '➕➖', description: 'Basic arithmetic with addition and subtraction' },
    { id: 'multiplication', label: '✖️ Multiplication', icon: '✖️', description: 'Master multiplication tables and beyond' },
    { id: 'division', label: '➗ Division', icon: '➗', description: 'Divide and conquer with division problems' }
  ];

  return (
    <div className="space-y-4 tablet:space-y-6">
      <div className="grid grid-cols-1 tablet:grid-cols-3 gap-3 tablet:gap-4">
        {operations.map((op) => (
          <button
            key={op.id}
            onClick={() => onOperationSelect(op.id)}
            className="p-4 tablet:p-6 rounded-xl font-bold transition-all duration-300 text-left bg-gray-800 text-white hover:bg-gold/20 hover:text-gold"
          >
            <div className="text-3xl tablet:text-4xl mb-2 tablet:mb-3">{op.icon}</div>
            <div className="text-base tablet:text-lg font-bold mb-1 tablet:mb-2">{op.label}</div>
            <div className="text-xs tablet:text-sm opacity-80">{op.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default OperationSelector;
