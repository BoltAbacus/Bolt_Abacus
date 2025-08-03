import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CoinsState {
  coins: number;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => void;
  resetCoins: () => void;
}

export const useCoinsStore = create<CoinsState>()(
  persist(
    (set, get) => ({
      coins: 0,

      addCoins: (amount: number) => {
        const { coins } = get();
        set({ coins: coins + amount });
      },

      spendCoins: (amount: number) => {
        const { coins } = get();
        if (coins >= amount) {
          set({ coins: coins - amount });
          return true;
        }
        return false;
      },

      resetCoins: () => {
        set({ coins: 0 });
      },
    }),
    {
      name: 'coins-storage',
    }
  )
); 