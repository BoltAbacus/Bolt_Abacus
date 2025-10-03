import { FC, useEffect, useRef, useState } from 'react';
import { useAbacusStore } from '@store/abacusStore';

export interface AbacusWidgetProps {
  onClose: () => void;
}

const AbacusWidget: FC<AbacusWidgetProps> = ({ onClose }) => {
  const FRAME_HEIGHT = 260;
  const FRAME_WIDTH = 520;
  const BEAM_Y = 85;
  const BEAD_SIZE = 28;
  const ROD_WIDTH = 3;
  const BEAD_SPACING = 30;
  
  // Minimum size to prevent bead collision
  const MIN_WIDTH = 400;
  const MIN_HEIGHT = 300;

  const { 
    abacusData, 
    setAbacusData, 
    resetAbacus, 
    position, 
    setPosition, 
    size, 
    setSize 
  } = useAbacusStore();
  
  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const widgetRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

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

  // Drag functionality
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        
        // Keep widget within viewport bounds
        const maxX = window.innerWidth - size.width;
        const maxY = window.innerHeight - size.height;
        
        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY))
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, size]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (headerRef.current && headerRef.current.contains(e.target as Node)) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const toggleUpperBead = (rodIndex: number) => {
    setAbacusData(
      abacusData.map((rod, i) => 
        i === rodIndex 
          ? { ...rod, upperBead: { isActive: !rod.upperBead.isActive } } 
          : rod
      )
    );
  };

  const toggleLowerBeads = (rodIndex: number, beadIndex: number) => {
    setAbacusData(
      abacusData.map((rod, i) => {
        if (i !== rodIndex) return rod;
        const newLowerBeads = [...rod.lowerBeads];
        newLowerBeads[beadIndex] = !newLowerBeads[beadIndex];
        return { ...rod, lowerBeads: newLowerBeads };
      })
    );
  };

  return (
    <div
      ref={widgetRef}
      className="fixed z-[120] bg-[#1c1c1e] text-white rounded-2xl shadow-2xl overflow-hidden select-none"
      style={{ 
        left: position.x, 
        top: position.y, 
        width: size.width, 
        height: size.height, 
        minWidth: MIN_WIDTH, 
        minHeight: MIN_HEIGHT, 
        border: 'none',
        cursor: isDragging ? 'grabbing' : 'default'
      }}
      onMouseDown={handleMouseDown}
    >
      <div 
        ref={headerRef}
        className="flex items-center justify-between px-3 py-2 border-b border-[#2c2c2e] cursor-grab active:cursor-grabbing"
      >
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

      <div className="p-3 pb-8 h-full overflow-auto flex items-center justify-center">
        <div
          className="relative mx-auto rounded-2xl shadow-2xl"
          style={{ 
            height: Math.min(FRAME_HEIGHT, size.height - 100), 
            width: Math.min(FRAME_WIDTH, size.width - 24), 
            background: '#1c1c1e', 
            border: '2px solid #FFD700' 
          }}
        >
          {/* Horizontal beam */}
          <div className="absolute left-0 right-0 flex items-center justify-center" style={{ top: BEAM_Y, height: 9, zIndex: 10 }}>
             <div
               className="w-[96%] h-2.5 rounded-full shadow-lg"
               style={{
                 background: '#FFD700',
                 border: 'none',
                 boxShadow: '0 1px 6px rgba(0,0,0,0.3)',
               }}
             />
          </div>

          {/* Rods and beads */}
          <div className="absolute left-0 top-0 w-full h-full flex justify-between px-10" style={{ zIndex: 5 }}>
            {abacusData.map((rod, rodIndex) => (
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
                  className={`absolute w-7 h-7 cursor-pointer shadow-lg flex items-center justify-center ${
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
                  const isActive = rod.lowerBeads[beadIndex];
                  let top;
                  if (isActive) {
                    top = BEAM_Y + 10 + beadIndex * BEAD_SPACING;
                  } else {
                    top = FRAME_HEIGHT - BEAD_SIZE - 12 - ((3 - beadIndex) * BEAD_SPACING);
                  }
                  return (
                    <div
                      key={beadIndex}
                      className={`absolute w-7 h-7 cursor-pointer shadow-lg flex items-center justify-center ${
                        isActive
                          ? 'bg-[#FFD700]'
                          : 'bg-[#48484a] hover:bg-[#636366]'
                      }`}
                      onClick={() => toggleLowerBeads(rodIndex, beadIndex)}
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

          {/* White dots for place value guidance */}
          <div className="absolute left-0 top-0 w-full h-full flex justify-between px-10 pointer-events-none" style={{ zIndex: 30 }}>
            {abacusData.map((_, rodIndex) => {
              const positionFromRight = abacusData.length - 1 - rodIndex;
              const shouldHaveDot = positionFromRight % 3 === 0;
              
              return (
                <div
                  key={`dot-${rodIndex}`}
                  className="relative flex flex-col items-center pointer-events-none"
                  style={{ height: FRAME_HEIGHT, width: BEAD_SIZE + 8 }}
                >
                  {shouldHaveDot && (
                    <div
                      className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
                      style={{
                        top: BEAM_Y,
                        width: 6,
                        height: 6,
                        background: 'white',
                        borderRadius: '50%',
                        zIndex: 12,
                        boxShadow: '0 0 4px rgba(255,255,255,0.8), 0 0 8px rgba(255,255,255,0.4)',
                        border: '1px solid rgba(255,255,255,0.9)',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Resize handles */}
      <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize" 
           style={{ 
             background: 'linear-gradient(-45deg, transparent 0%, transparent 30%, #FFD700 30%, #FFD700 40%, transparent 40%, transparent 70%, #FFD700 70%, #FFD700 100%)',
             borderBottomRightRadius: '8px'
           }}
           onMouseDown={(e) => {
             e.preventDefault();
             e.stopPropagation();
             
             const startX = e.clientX;
             const startY = e.clientY;
             const startWidth = size.width;
             const startHeight = size.height;
             
             const handleMouseMove = (e: MouseEvent) => {
               const newWidth = Math.max(MIN_WIDTH, startWidth + (e.clientX - startX));
               const newHeight = Math.max(MIN_HEIGHT, startHeight + (e.clientY - startY));
               
               setSize({ width: newWidth, height: newHeight });
             };
             
             const handleMouseUp = () => {
               document.removeEventListener('mousemove', handleMouseMove);
               document.removeEventListener('mouseup', handleMouseUp);
             };
             
             document.addEventListener('mousemove', handleMouseMove);
             document.addEventListener('mouseup', handleMouseUp);
           }}
      />
    </div>
  );
};

export default AbacusWidget;

