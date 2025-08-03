import { FC } from 'react';
import { useCoinsStore } from '@store/coinsStore';

export interface CoinsDisplayProps {
  className?: string;
}

const CoinsDisplay: FC<CoinsDisplayProps> = ({ className = '' }) => {
  const { coins } = useCoinsStore();

  return (
    <div className={`bg-[#1b1b1b] text-white p-4 rounded-lg flex items-center space-x-3 ${className}`}>
      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg">
        <span className="text-white font-bold text-xl">🪙</span>
      </div>
      <div>
        <p className="text-2xl font-black text-yellow-200 drop-shadow-lg">{coins.toLocaleString()}</p>
        <p className="text-sm text-yellow-100 font-semibold">COINS</p>
      </div>
    </div>
  );
};

export default CoinsDisplay; 