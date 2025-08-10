import { FC } from 'react';
import { useCoinsStore } from '@store/coinsStore';

export interface CoinsDisplayProps {
  className?: string;
}

const CoinsDisplay: FC<CoinsDisplayProps> = ({ className = '' }) => {
  const { coins } = useCoinsStore();

  return (
    <div className={`bg-[#080808]/80 hover:bg-[#191919] text-white p-4 rounded-lg border border-gold/50 ring-1 ring-white/5 backdrop-blur-md shadow-[0_8px_20px_rgba(0,0,0,0.45)] transition-colors flex items-center space-x-3 ${className}`}>
      <div className="flex items-center justify-center w-12 h-12 bg-gold rounded-full shadow">
        <span className="text-black font-bold text-xl">⚡</span>
      </div>
      <div>
        <p className="text-2xl font-black text-gold drop-shadow-lg">{coins.toLocaleString()}</p>
        <p className="text-sm text-white/80 font-semibold">XP</p>
      </div>
    </div>
  );
};

export default CoinsDisplay; 