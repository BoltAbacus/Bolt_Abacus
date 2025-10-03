import { create } from 'zustand';

export interface AbacusRod {
  rodIndex: number;
  upperBead: { isActive: boolean };
  lowerBeads: boolean[];
}

interface AbacusState {
  isOpen: boolean;
  abacusData: AbacusRod[];
  position: { x: number; y: number };
  size: { width: number; height: number };
  openAbacus: () => void;
  closeAbacus: () => void;
  setAbacusData: (data: AbacusRod[]) => void;
  resetAbacus: () => void;
  setPosition: (position: { x: number; y: number }) => void;
  setSize: (size: { width: number; height: number }) => void;
}

const createInitialRods = (): AbacusRod[] => {
  const ROD_COUNT = 13;
  return Array.from({ length: ROD_COUNT }, (_, rodIndex) => ({
    rodIndex,
    upperBead: { isActive: false },
    lowerBeads: [false, false, false, false],
  }));
};

export const useAbacusStore = create<AbacusState>((set) => ({
  isOpen: false,
  abacusData: createInitialRods(),
  position: { 
    x: typeof window !== 'undefined' ? window.innerWidth - 560 : 0, 
    y: typeof window !== 'undefined' ? window.innerHeight - 400 : 20 
  },
  size: { width: 560, height: 380 },
  openAbacus: () => set({ isOpen: true }),
  closeAbacus: () => set({ isOpen: false }),
  setAbacusData: (data) => set({ abacusData: data }),
  resetAbacus: () => set({ abacusData: createInitialRods() }),
  setPosition: (position) => set({ position }),
  setSize: (size) => set({ 
    size: { 
      width: Math.max(400, size.width), 
      height: Math.max(300, size.height) 
    } 
  }),
}));
