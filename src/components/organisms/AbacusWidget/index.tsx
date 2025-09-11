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
      className="fixed bottom-4 right-4 z-[120] bg-[#1c1c1e] text-white rounded-2xl shadow-2xl resize overflow-auto"
      style={{ width: FRAME_WIDTH + 40, height: FRAME_HEIGHT + 120, minWidth: 360, minHeight: 260, border: 'none' }}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#2c2c2e]">
        <div className="text-sm font-semibold">
          <span className="mr-1">🧮</span> Abacus
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetAbacus}
            className="w-8 h-8 grid place-items-center rounded-md hover:bg-[#2c2c2e] transition-colors"
            title="Reset Abacus"
            style={{ border: 'none' }}
          >
            🔄
          </button>
          <button
            aria-label="Close mini abacus"
            onClick={onClose}
            className="w-8 h-8 grid place-items-center rounded-md hover:bg-[#2c2c2e] transition-colors"
            style={{ border: 'none' }}
          >
            ×
          </button>
        </div>
      </div>

      <div className="p-3 pb-8">
        <div
          className="relative mx-auto rounded-2xl shadow-2xl"
          style={{ height: FRAME_HEIGHT, width: FRAME_WIDTH, background: '#1c1c1e', border: '2px solid #FFD700' }}
        >
          {/* Horizontal beam */}
          <div className="absolute left-0 right-0 flex items-center justify-center" style={{ top: BEAM_Y, height: 9, zIndex: 10 }}>
            <div
              className="w-[92%] h-2.5 rounded-full shadow-lg"
              style={{
                background: '#FFD700',
                border: 'none',
                boxShadow: '0 1px 6px rgba(0,0,0,0.3)',
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
                    height: FRAME_HEIGHT - 24,
                    width: ROD_WIDTH,
                    background: '#2c2c2e',
                    borderRadius: 6,
                    zIndex: 1,
                    boxShadow: '0 0 8px rgba(0,0,0,0.3)',
                  }}
                />

                {/* Upper bead */}
                <div
                  className={`absolute w-7 h-7 cursor-pointer shadow-lg flex items-center justify-center transition-all duration-300 ${
                    rod.upperBead.isActive
                      ? 'bg-[#FFD700]'
                      : 'bg-[#48484a] hover:bg-[#636366]'
                  }`}
                  onClick={() => toggleUpperBead(rodIndex)}
                  style={{
                    left: '50%',
                    transform: 'translateX(-50%) rotate(45deg)',
                    top: rod.upperBead.isActive ? BEAM_Y - BEAD_SIZE - 4 : 18,
                    boxShadow: '0 3px 10px rgba(0,0,0,0.3)',
                    zIndex: 15,
                    border: 'none',
                    borderRadius: '3px'
                  }}
                >
                  <div className="w-3 h-1.5 bg-white opacity-20" style={{ transform: 'rotate(-45deg)', borderRadius: '1px' }} />
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
                      className={`absolute w-7 h-7 cursor-pointer shadow-lg flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? 'bg-[#FFD700]'
                          : 'bg-[#48484a] hover:bg-[#636366]'
                      }`}
                      onClick={() => toggleLowerBeads(rodIndex, beadIndex + 1)}
                      style={{
                        left: '50%',
                        transform: 'translateX(-50%) rotate(45deg)',
                        top,
                        boxShadow: '0 3px 10px rgba(0,0,0,0.3)',
                        zIndex: 15,
                        border: 'none',
                        borderRadius: '3px'
                      }}
                    >
                      <div className="w-3 h-1.5 bg-white opacity-20" style={{ transform: 'rotate(-45deg)', borderRadius: '1px' }} />
                    </div>
                  );
                })}

              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AbacusWidget;

