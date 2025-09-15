import { FC } from 'react';

export interface OperationSelectorProps {
  onOperationSelect: (operation: string) => void;
}

const OperationSelector: FC<OperationSelectorProps> = ({ onOperationSelect }) => {
  const operations = [
    {
      id: 'addition',
      title: 'Addition & Subtraction',
      symbol: '±',
      description: 'Master addition and subtraction together',
      gradient: 'from-blue-500/20 to-cyan-500/20',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-400'
    },
    {
      id: 'multiplication',
      title: 'Multiplication',
      symbol: '×',
      description: 'Multiply your mathematical prowess',
      gradient: 'from-green-500/20 to-emerald-500/20',
      borderColor: 'border-green-500/30',
      iconColor: 'text-green-400'
    },
    {
      id: 'division',
      title: 'Division',
      symbol: '÷',
      description: 'Divide and conquer math problems',
      gradient: 'from-purple-500/20 to-violet-500/20',
      borderColor: 'border-purple-500/30',
      iconColor: 'text-purple-400'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-6">
        {operations.map((operation) => (
          <button
            key={operation.id}
            onClick={() => onOperationSelect(operation.id)}
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
              <div className={`text-5xl font-bold mb-4 ${operation.iconColor} group-hover:scale-110 transition-transform duration-300 drop-shadow-lg`}>
                {operation.symbol}
              </div>
              
              <h3 className="text-xl font-semibold mb-2 drop-shadow-md" style={{ color: '#ffffff' }}>
                {operation.title}
              </h3>
              <p className="text-sm leading-relaxed drop-shadow-sm" style={{ color: '#818181' }}>
                {operation.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default OperationSelector;
