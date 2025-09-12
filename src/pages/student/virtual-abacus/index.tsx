import { FC, useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import SeoComponent from '@components/atoms/SeoComponent';
import ErrorBox from '@components/organisms/ErrorBox';
import LoadingBox from '@components/organisms/LoadingBox';
import { dashboardRequestV2 } from '@services/student';
import { useAuthStore } from '@store/authStore';
import { useStreakStore } from '@store/streakStore';
import { ERRORS, MESSAGES } from '@constants/app';
import { LOGIN_PAGE, STUDENT_DASHBOARD } from '@constants/routes';

export interface StudentVirtualAbacusPageProps {}

// Virtual Abacus Component
const VirtualAbacus: FC = () => {
  const [, setValue] = useState(0);
  const [rodCount, setRodCount] = useState(13);
  
  // Soroban layout constants
  const ROD_COUNT = rodCount;
  const FRAME_HEIGHT = 380; // Increased to accommodate beads inside frame
  const BEAM_Y = 130; // Adjusted for larger frame
  const BEAD_SIZE = 36; // Increased from 28
  const ROD_WIDTH = 4; // Increased from 3
  const BEAD_SPACING = 40; // Increased spacing between beads
  
  // Soroban rod structure: each rod has 1 upper bead and 4 lower beads
  const createRods = (count: number) => Array.from({ length: count }, (_, rodIndex) => ({
    rodIndex,
    upperBead: { isActive: false }, // Heaven bead (value 5)
    lowerBeads: { count: 0 } // Earth beads (value 1 each, move as group)
  }));

  const [abacusState, setAbacusState] = useState(() => createRods(ROD_COUNT));

  // Calculate value based on soroban rules
  const calculateValue = (state: any[]) => {
    let total = 0;
    state.forEach((rod, rodIndex) => {
      let rodValue = 0;
      
      // Add upper bead value (5) if active (touching beam)
      if (rod.upperBead.isActive) {
        rodValue += 5;
      }
      
      // Add lower beads values (1 each) that are active (touching beam)
      rodValue += rod.lowerBeads.count;
      
      // Multiply by position (ones, tens, hundreds, etc.)
      total += rodValue * Math.pow(10, rodCount - 1 - rodIndex);
    });
    return total;
  };

  // Toggle upper bead (heaven bead)
  const toggleUpperBead = (rodIndex: number) => {
    setAbacusState(prev => {
      const newState = prev.map((rod, index) =>
        index === rodIndex
          ? { ...rod, upperBead: { isActive: !rod.upperBead.isActive } }
          : rod
      );
      const newValue = calculateValue(newState);
      setValue(newValue);
      return newState;
    });
  };

  // Toggle lower beads (earth beads) - they move as a group
  const toggleLowerBeads = (rodIndex: number, targetCount: number) => {
    setAbacusState(prev => {
      const newState = prev.map((rod, index) => {
        if (index !== rodIndex) return rod;
        
        // If clicking the same count, reset to 0
        const newCount = rod.lowerBeads.count === targetCount ? 0 : targetCount;
        return { ...rod, lowerBeads: { count: newCount } };
      });
      
      const newValue = calculateValue(newState);
      setValue(newValue);
      return newState;
    });
  };

  const resetAbacus = () => {
    setAbacusState(createRods(rodCount));
    setValue(0);
  };


  const handleRodCountChange = (newCount: number) => {
    if (newCount >= 1 && newCount <= 20) {
      setRodCount(newCount);
      setAbacusState(createRods(newCount));
      setValue(0);
    }
  };

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1c1c1e;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #48484a;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #636366;
        }
      `}</style>
      <div className="bg-[#1c1c1e] hover:bg-[#2c2c2e] transition-colors text-white p-4 tablet:p-8 rounded-2xl shadow-2xl shadow-black/50 relative overflow-hidden" style={{ border: 'none' }}>
      
      <div className="relative z-10">
        <h2 className="text-xl tablet:text-3xl font-bold mb-6 tablet:mb-8 flex items-center text-white">
          <span className="mr-3 text-xl tablet:text-3xl">🧮</span>
          Interactive Soroban Abacus
        </h2>
        
        {/* Rod Count Selector */}
        <div className="bg-[#1c1c1e] hover:bg-[#2c2c2e] p-4 tablet:p-6 rounded-2xl shadow-xl transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,186,8,0.25)] mb-6 tablet:mb-8 relative overflow-hidden" style={{ border: 'none' }}>
          <div className="relative z-10">
            <h3 className="text-lg tablet:text-xl font-bold text-[#FFD700] mb-4 flex items-center">
              <span className="mr-2">⚙️</span>
              Abacus Configuration
            </h3>
            <div className="flex flex-col tablet:flex-row tablet:items-center gap-4">
              <label className="text-gray-300 font-medium">
                Number of Rods:
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRodCountChange(Math.max(1, rodCount - 1))}
                  className="bg-[#2c2c2e] hover:bg-[#3c3c3e] text-[#FFD700] w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
                  disabled={rodCount <= 1}
                >
                  −
                </button>
                <div className="bg-[#2c2c2e] text-white px-4 py-2 rounded-lg w-16 text-center font-mono text-lg">
                  {rodCount}
                </div>
                <button
                  onClick={() => handleRodCountChange(Math.min(20, rodCount + 1))}
                  className="bg-[#2c2c2e] hover:bg-[#3c3c3e] text-[#FFD700] w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
                  disabled={rodCount >= 20}
                >
                  +
                </button>
                <span className="text-gray-400 text-sm">(1-20)</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Each rod represents a different place value (ones, tens, hundreds, etc.)
            </p>
          </div>
        </div>

        {/* Abacus Frame with Controls */}
         <div className="bg-[#1c1c1e] hover:bg-[#1c1c1e] p-4 tablet:p-6 rounded-2xl shadow-xl transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,186,8,0.25)] mb-6 tablet:mb-8 relative overflow-hidden" style={{ border: 'none' }}>
          <div className="relative z-10 flex flex-col tablet:flex-row tablet:items-start gap-4 tablet:gap-6">
            {/* Abacus Board */}
            <div 
              className="flex-1 pb-8 tablet:pb-12 overflow-x-auto custom-scrollbar"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#48484a #1c1c1e'
              }}
            >
               <div
                 className="relative mx-auto shadow-2xl"
                 style={{ 
                   height: FRAME_HEIGHT, 
                   width: `${Math.max(300, rodCount * 60)}px`,
                   minWidth: '300px',
                   background: '#1c1c1e',
                   border: '2px solid #FFD700',
                   borderRadius: '16px'
                 }}
               >
        {/* Horizontal beam */}
        <div
          className="absolute left-0 right-0 flex items-center justify-center"
          style={{ top: BEAM_Y, height: 12, zIndex: 10 }}
        >
          <div
            className="h-3 shadow-lg"
            style={{
              width: '100%',
              background: '#FFD700',
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          />
        </div>

        {/* Rods and beads */}
        <div className="absolute left-0 top-0 w-full h-full flex justify-evenly px-8" style={{ zIndex: 5 }}>
          {abacusState.map((_, rodIndex) => (
            <div
              key={rodIndex}
              className="relative flex flex-col items-center"
              style={{ height: FRAME_HEIGHT, width: BEAD_SIZE + 12 }}
            >
              {/* Rod */}
                <div
                  className="absolute left-1/2 -translate-x-1/2"
                  style={{
                    top: 0,
                     height: FRAME_HEIGHT - 18,
                    width: ROD_WIDTH,
                    background: '#2c2c2e',
                    borderRadius: 6,
                    zIndex: 1,
                    boxShadow: '0 0 8px rgba(0,0,0,0.3)',
                  }}
                />

               {/* Upper bead (Heaven bead) */}
               <div
                 className={`absolute w-9 h-9 cursor-pointer shadow-lg flex items-center justify-center transition-all duration-300 ${
                   rod.upperBead.isActive
                     ? 'bg-[#FFD700]'
                     : 'bg-[#48484a] hover:bg-[#636366]'
                 }`}
                 onClick={() => toggleUpperBead(rodIndex)}
                 style={{
                   left: '50%',
                   transform: 'translateX(-50%) rotate(45deg)',
                   top: rod.upperBead.isActive ? BEAM_Y - BEAD_SIZE - 6 : 24,
                   boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                   zIndex: 15,
                   border: 'none',
                   borderRadius: '4px'
                 }}
               >
                 <div className="w-4 h-2 bg-white opacity-20" style={{ transform: 'rotate(-45deg)', borderRadius: '2px' }} />
               </div>

              {/* Lower beads (Earth beads) - move as a group */}
              {Array.from({ length: 4 }, (_, beadIndex) => {
                // In a real soroban, lower beads stack from bottom to beam when active
                // When inactive, they rest at the bottom
                const isActive = beadIndex < rod.lowerBeads.count;
                let top;
                
                if (isActive) {
                  // Active beads stack from the beam downward
                  // First active bead is closest to beam, others stack below
                  const activePosition = rod.lowerBeads.count - beadIndex - 1;
                  top = BEAM_Y + 24 + (activePosition * BEAD_SPACING); // Increased from 12 to 24 to keep beads below beam
                } else {
                  // Inactive beads rest at the bottom, stacked from bottom up
                  const inactivePosition = 4 - beadIndex - 1;
                  top = FRAME_HEIGHT - BEAD_SIZE - 20 - (inactivePosition * BEAD_SPACING); // Positioned inside frame
                }
                
                 return (
                   <div
                     key={beadIndex}
                     className={`absolute w-9 h-9 cursor-pointer shadow-lg flex items-center justify-center transition-all duration-300 ${
                       isActive
                         ? 'bg-[#FFD700]'
                         : 'bg-[#48484a] hover:bg-[#636366]'
                     }`}
                     onClick={() => toggleLowerBeads(rodIndex, beadIndex + 1)}
                     style={{
                       left: '50%',
                       transform: 'translateX(-50%) rotate(45deg)',
                       top,
                       boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                       zIndex: 15,
                       border: 'none',
                       borderRadius: '4px'
                     }}
                   >
                     <div className="w-4 h-2 bg-white opacity-20" style={{ transform: 'rotate(-45deg)', borderRadius: '2px' }} />
                   </div>
                 );
              })}

            </div>
          ))}
        </div>
              </div>
            </div>
            
             {/* Controls Sidebar */}
             <div className="flex flex-row tablet:flex-col gap-4 min-w-[80px] justify-center tablet:justify-start">
               <button 
                 onClick={resetAbacus}
                 className="bg-[#1c1c1e] hover:bg-[#2c2c2e] text-[#FFD700] font-bold p-3 tablet:p-4 rounded-xl shadow-[0_8px_20px_rgba(0,0,0,0.45)] transition-all duration-200 hover:shadow-[0_0_40px_rgba(255,186,8,0.25)] hover:scale-105 flex items-center justify-center"
                 title="Reset Abacus"
                 style={{ border: 'none' }}
               >
                 🔄
               </button>
             </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-[#1c1c1e] hover:bg-[#2c2c2e] p-4 tablet:p-6 rounded-2xl shadow-xl transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,186,8,0.25)] relative overflow-hidden" style={{ border: 'none' }}>
          <div className="relative z-10">
            <h3 className="text-lg tablet:text-xl font-bold text-[#FFD700] mb-4 flex items-center">
              <span className="mr-2">📖</span>
              How to Use Soroban
            </h3>
            <ul className="text-sm text-gray-300 space-y-2">
              <li className="flex items-start">
                <span className="text-[#FFD700] mr-2">•</span>
                <span><strong>Upper beads (Heaven):</strong> Click to toggle. Each represents 5 units when touching the beam</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#FFD700] mr-2">•</span>
                <span><strong>Lower beads (Earth):</strong> Click any bead to move that many beads to the beam. They move as a group.</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#FFD700] mr-2">•</span>
                <span><strong>Only beads touching the beam are counted</strong> in the calculation</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#FFD700] mr-2">•</span>
                <span><strong>Each rod represents a different place value</strong> (ones, tens, hundreds, etc.)</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#FFD700] mr-2">•</span>
                <span><strong>Use the controls</strong> to reset or generate random numbers</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

const StudentVirtualAbacusPage: FC<StudentVirtualAbacusPageProps> = () => {
  const authToken = useAuthStore((state) => state.authToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fallBackLink, setFallBackLink] = useState<string>(STUDENT_DASHBOARD);
  const [fallBackAction, setFallBackAction] = useState<string>(MESSAGES.TRY_AGAIN);
  const { updateStreak } = useStreakStore();

  useEffect(() => {
    const getDashboardData = async () => {
      if (isAuthenticated) {
        try {
          const res = await dashboardRequestV2(authToken!);
          if (res.status === 200) {
            setApiError(null);
            updateStreak();
          }
        } catch (error) {
          if (isAxiosError(error)) {
            setApiError(error.response?.data?.message || ERRORS.SERVER_ERROR);
          } else {
            setApiError(ERRORS.SERVER_ERROR);
          }
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setApiError(ERRORS.AUTHENTICATION_ERROR);
        setFallBackLink(LOGIN_PAGE);
        setFallBackAction(MESSAGES.GO_LOGIN);
      }
    };
    getDashboardData();
  }, [authToken, isAuthenticated, updateStreak]);

  return (
    <>
      <style>{`
        body {
          background: #000000 !important;
        }
        html {
          background: #000000 !important;
        }
        body::-webkit-scrollbar {
          width: 8px;
        }
        body::-webkit-scrollbar-track {
          background: #000000;
        }
        body::-webkit-scrollbar-thumb {
          background: #48484a;
          border-radius: 4px;
        }
        body::-webkit-scrollbar-thumb:hover {
          background: #636366;
        }
        html {
          scrollbar-width: thin;
          scrollbar-color: #48484a #000000;
        }
      `}</style>
      <div className="min-h-screen bg-black">
      {loading ? (
        <>
          <SeoComponent title="Loading" />
          <LoadingBox />
        </>
      ) : (
        <div>
          {apiError ? (
            <>
              <SeoComponent title="Error" />
              <ErrorBox 
                errorMessage={apiError} 
                link={fallBackLink} 
                buttonText={fallBackAction} 
              />
            </>
          ) : (
            <>
              <SeoComponent title="Virtual Abacus" />
              <div className="space-y-4 tablet:space-y-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-[#1c1c1e] hover:bg-[#2c2c2e] transition-colors text-white p-4 tablet:p-8 rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.65)] relative overflow-hidden" style={{ border: 'none' }}>
                  {/* Subtle gold glow overlays */}
                  <div className="pointer-events-none absolute -inset-14 bg-[radial-gradient(circle_at_top_left,rgba(255,186,8,0.08),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(250,163,7,0.06),transparent_45%)]"></div>
                  
                  <div className="relative z-10">
                    <h1 className="text-2xl tablet:text-4xl font-bold mb-4 flex items-center text-white">
                      <span className="mr-3 text-2xl tablet:text-4xl">🧮</span>
                      Virtual Soroban Abacus
                    </h1>
                    <p className="text-gray-300 text-sm tablet:text-lg">
                      Interactive soroban (Japanese abacus) tool for practicing mental math and calculations.
                    </p>
                  </div>
                </div>

                {/* Virtual Abacus Component */}
                <VirtualAbacus />

                {/* Features */}
                <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-4 tablet:gap-6">
                  <div className="bg-[#1c1c1e] hover:bg-[#2c2c2e] p-6 rounded-2xl shadow-xl transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,186,8,0.25)] group relative overflow-hidden" style={{ border: 'none' }}>
                    <div className="relative z-10">
                      <h3 className="text-lg font-bold mb-3 text-[#FFD700] flex items-center">
                        <span className="mr-2">🎯</span>
                        Proper Soroban Logic
                      </h3>
                      <p className="text-gray-300 text-sm">
                        Follows authentic soroban rules with heaven beads (5 units) and earth beads (1 unit each) that move as groups.
                      </p>
                    </div>
                  </div>
                  <div className="bg-[#1c1c1e] hover:bg-[#2c2c2e] p-6 rounded-2xl shadow-xl transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,186,8,0.25)] group relative overflow-hidden" style={{ border: 'none' }}>
                    <div className="relative z-10">
                      <h3 className="text-lg font-bold mb-3 text-[#FFD700] flex items-center">
                        <span className="mr-2">⚡</span>
                        Real-time Calculation
                      </h3>
                      <p className="text-gray-300 text-sm">
                        Only beads touching the beam are counted, providing accurate soroban calculations.
                      </p>
                    </div>
                  </div>
                  <div className="bg-[#1c1c1e] hover:bg-[#2c2c2e] p-6 rounded-2xl shadow-xl transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,186,8,0.25)] group relative overflow-hidden" style={{ border: 'none' }}>
                    <div className="relative z-10">
                      <h3 className="text-lg font-bold mb-3 text-[#FFD700] flex items-center">
                        <span className="mr-2">📚</span>
                        Educational Tool
                      </h3>
                      <p className="text-gray-300 text-sm">
                        Perfect for learning traditional abacus techniques and mental math skills.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
    </>
  );
};

export default StudentVirtualAbacusPage;