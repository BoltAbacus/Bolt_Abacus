import { FC, useMemo, useState, useEffect } from 'react';

export interface AbacusWidgetProps {
  onClose: () => void;
}

const AbacusWidget: FC<AbacusWidgetProps> = ({ onClose }) => {
  const ROD_COUNT = 13;
  const FRAME_HEIGHT = 260;
  const FRAME_WIDTH = 520;
  const BEAM_Y = 105;
  const BEAD_SIZE = 28;
  const ROD_WIDTH = 3;
  const BEAD_SPACING = 30;

  const initialRods = useMemo(
    () =>
      Array.from({ length: ROD_COUNT }, (_, rodIndex) => ({
        rodIndex,
        upperBead: { isActive: false },
        lowerBeads: { count: 0 },
      })),
    []
  );

  const [abacusState, setAbacusState] = useState(initialRods);

  // ESC key handler
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [onClose]);

  const resetAbacus = () => {
    setAbacusState(initialRods);
  };

  const toggleUpperBead = (rodIndex: number) => {
    setAbacusState((prev) =>
      prev.map((rod, i) => (i === rodIndex ? { ...rod, upperBead: { isActive: !rod.upperBead.isActive } } : rod))
    );
  };

  const toggleLowerBeads = (rodIndex: number, targetCount: number) => {
    setAbacusState((prev) =>
      prev.map((rod, i) => {
        if (i !== rodIndex) return rod;
        const newCount = rod.lowerBeads.count === targetCount ? 0 : targetCount;
        return { ...rod, lowerBeads: { count: newCount } };
      })
    );
  };

  return (
    <div
      className="fixed bottom-4 right-4 z-[120] bg-black/90 text-white rounded-2xl border border-gold/50 ring-1 ring-white/5 shadow-2xl backdrop-blur-md resize overflow-auto"
      style={{ width: FRAME_WIDTH + 40, height: FRAME_HEIGHT + 120, minWidth: 360, minHeight: 260 }}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-gold/30">
        <div className="text-sm font-semibold">
          <span className="mr-1">🧮</span> Abacus
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetAbacus}
            className="w-8 h-8 grid place-items-center rounded-md border border-gold/30 hover:bg-white/10 transition-colors"
            title="Reset Abacus"
          >
            🔄
          </button>
          <button
            aria-label="Close mini abacus"
            onClick={onClose}
            className="w-8 h-8 grid place-items-center rounded-md border border-gold/30 hover:bg-white/10 transition-colors"
          >
            ×
          </button>
        </div>
      </div>

      <div className="p-3 pb-8">
        <div
          className="relative mx-auto bg-gradient-to-b from-[#d4a574] to-[#8B4513] rounded-2xl border-8 border-[#654321] shadow-2xl"
          style={{ height: FRAME_HEIGHT, width: FRAME_WIDTH }}
        >
          {/* Horizontal beam */}
          <div className="absolute left-0 right-0 flex items-center justify-center" style={{ top: BEAM_Y, height: 18, zIndex: 10 }}>
            <div
              className="w-[92%] h-5 rounded-full shadow-lg"
              style={{
                background: 'linear-gradient(90deg, #FFD700 0%, #bfa14a 50%, #FFD700 100%)',
                border: '2px solid #bfa14a',
                boxShadow: '0 1px 6px #0005, 0 0px 0px #fff8 inset',
              }}
            />
          </div>

          {/* Rods and beads */}
          <div className="absolute left-0 top-0 w-full h-full flex justify-between px-10" style={{ zIndex: 5 }}>
            {abacusState.map((rod, rodIndex) => (
              <div key={rodIndex} className="relative flex flex-col items-center" style={{ height: FRAME_HEIGHT, width: BEAD_SIZE + 8 }}>
                {/* Rod */}
                <div
                  className="absolute left-1/2 -translate-x-1/2"
                  style={{
                    top: 0,
                    height: FRAME_HEIGHT - 18,
                    width: ROD_WIDTH,
                    background: 'linear-gradient(to bottom, #FFD700 0%, #654321 100%)',
                    borderRadius: 6,
                    zIndex: 1,
                    boxShadow: '0 0 8px #0003',
                  }}
                />

                {/* Upper bead */}
                <div
                  className={`absolute w-7 h-7 rounded-full cursor-pointer shadow-lg border-2 flex items-center justify-center ${
                    rod.upperBead.isActive
                      ? 'bg-gradient-to-b from-[#FFD700] to-[#bfa14a] border-[#bfa14a]'
                      : 'bg-gradient-to-b from-[#fffbe6] to-[#8B4513] border-[#654321] hover:brightness-110'
                  }`}
                  onClick={() => toggleUpperBead(rodIndex)}
                  style={{
                    left: '50%',
                    transform: 'translateX(-50%)',
                    top: rod.upperBead.isActive ? BEAM_Y - BEAD_SIZE - 4 : 12,
                    boxShadow: '0 3px 10px #0006',
                    zIndex: 15,
                  }}
                >
                  <div className="w-3 h-1.5 rounded-full bg-white opacity-30" />
                </div>

                {/* Lower beads */}
                {Array.from({ length: 4 }, (_, beadIndex) => {
                  const isActive = beadIndex < rod.lowerBeads.count;
                  let top;
                  if (isActive) {
                    const activePosition = rod.lowerBeads.count - beadIndex - 1;
                    top = BEAM_Y + 10 + activePosition * BEAD_SPACING;
                  } else {
                    const inactivePosition = 4 - beadIndex - 1;
                    top = FRAME_HEIGHT - BEAD_SIZE - 12 - inactivePosition * BEAD_SPACING;
                  }
                  return (
                    <div
                      key={beadIndex}
                      className={`absolute w-7 h-7 rounded-full cursor-pointer shadow-lg border-2 flex items-center justify-center ${
                        isActive
                          ? 'bg-gradient-to-b from-[#FFD700] to-[#bfa14a] border-[#bfa14a]'
                          : 'bg-gradient-to-b from-[#fffbe6] to-[#8B4513] border-[#654321] hover:brightness-110'
                      }`}
                      onClick={() => toggleLowerBeads(rodIndex, beadIndex + 1)}
                      style={{
                        left: '50%',
                        transform: 'translateX(-50%)',
                        top,
                        boxShadow: '0 3px 10px #0006',
                        zIndex: 15,
                      }}
                    >
                      <div className="w-3 h-1.5 rounded-full bg-white opacity-30" />
                    </div>
                  );
                })}

                {/* Position labels */}
                <div
                  className="text-xs text-[#FFD700] font-mono font-bold whitespace-nowrap bg-black/70 px-1 py-0.5 rounded shadow-lg"
                  style={{
                    position: 'absolute',
                    bottom: -30,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    textShadow: '0 1px 2px #000a',
                    zIndex: 20,
                  }}
                >
                  {rodIndex === 12
                    ? '1'
                    : rodIndex === 11
                    ? '10'
                    : rodIndex === 10
                    ? '100'
                    : rodIndex === 9
                    ? '1K'
                    : rodIndex === 8
                    ? '10K'
                    : rodIndex === 7
                    ? '100K'
                    : rodIndex === 6
                    ? '1M'
                    : rodIndex === 5
                    ? '10M'
                    : rodIndex === 4
                    ? '100M'
                    : rodIndex === 3
                    ? '1B'
                    : rodIndex === 2
                    ? '10B'
                    : rodIndex === 1
                    ? '100B'
                    : '1T'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AbacusWidget;

