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
  const [_, setValue] = useState(0);
  const [displayValue, setDisplayValue] = useState('0');
  
  // Soroban layout constants
  const ROD_COUNT = 13;
  const FRAME_HEIGHT = 380; // Increased to accommodate beads inside frame
  const FRAME_WIDTH = 900; // Reduced to prevent horizontal scroll
  const BEAM_Y = 130; // Adjusted for larger frame
  const BEAD_SIZE = 36; // Increased from 28
  const ROD_WIDTH = 4; // Increased from 3
  const BEAD_SPACING = 40; // Increased spacing between beads
  
  // Soroban rod structure: each rod has 1 upper bead and 4 lower beads
  const rods = Array.from({ length: ROD_COUNT }, (_, rodIndex) => ({
    rodIndex,
    upperBead: { isActive: false }, // Heaven bead (value 5)
    lowerBeads: { count: 0 } // Earth beads (value 1 each, move as group)
  }));

  const [abacusState, setAbacusState] = useState(rods);

  // Calculate value based on soroban rules
  const calculateValue = (state: typeof rods) => {
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
      total += rodValue * Math.pow(10, 12 - rodIndex);
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
      setDisplayValue(newValue.toLocaleString());
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
      setDisplayValue(newValue.toLocaleString());
      return newState;
    });
  };

  const resetAbacus = () => {
    setAbacusState(rods);
    setValue(0);
    setDisplayValue('0');
  };

  const setRandomValue = () => {
    const randomValue = Math.floor(Math.random() * 9999999999999);
    setValue(randomValue);
    setDisplayValue(randomValue.toLocaleString());
    
    // Convert number to abacus state
    const newState = rods.map((_, rodIndex) => {
      const position = 12 - rodIndex;
      const digit = Math.floor(randomValue / Math.pow(10, position)) % 10;
      
      const upperBead = { isActive: digit >= 5 };
      const lowerBeads = { count: digit >= 5 ? digit - 5 : digit };
      
      return { rodIndex, upperBead, lowerBeads };
    });
    
    setAbacusState(newState);
  };

  return (
    <div className="bg-[#080808] hover:bg-[#1b1b1b] transition-colors backdrop-blur-xl text-white p-8 rounded-2xl border border-gold/50 shadow-2xl shadow-black/50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 animate-pulse"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-500"></div>
      
      <div className="relative z-10">
        <h2 className="text-3xl font-bold mb-8 flex items-center text-white">
          <span className="mr-3 text-3xl">🧮</span>
          Interactive Soroban Abacus
        </h2>
        
        {/* Display */}
        <div className="bg-[#080808]/80 hover:bg-[#191919] backdrop-blur-xl p-6 rounded-2xl border border-gold/40 ring-1 ring-white/5 shadow-xl transition-all duration-500 hover:border-gold hover:shadow-[0_0_40px_rgba(255,186,8,0.25)] mb-8 relative overflow-hidden">
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-[#FFD700]/10 opacity-0 hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
          <div className="relative z-10">
            <div className="text-right text-4xl font-mono text-gold font-bold">
              {displayValue}
            </div>
          </div>
        </div>

        {/* Abacus Frame with Controls */}
        <div className="bg-[#080808]/80 hover:bg-[#191919] backdrop-blur-xl p-6 rounded-2xl border border-gold/40 ring-1 ring-white/5 shadow-xl transition-all duration-500 hover:border-gold hover:shadow-[0_0_40px_rgba(255,186,8,0.25)] mb-8 relative overflow-hidden">
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-[#FFD700]/10 opacity-0 hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
          <div className="relative z-10 flex items-start gap-6">
            {/* Abacus Board */}
            <div className="flex-1 pb-12">
              <div
                className="relative mx-auto bg-gradient-to-b from-[#d4a574] to-[#8B4513] rounded-2xl border-8 border-[#654321] shadow-2xl max-w-full"
                style={{ height: FRAME_HEIGHT, width: '100%', maxWidth: FRAME_WIDTH }}
              >
        {/* Horizontal beam */}
        <div
          className="absolute left-0 right-0 flex items-center justify-center"
          style={{ top: BEAM_Y, height: 24, zIndex: 10 }}
        >
          <div
            className="w-[92%] h-6 rounded-full shadow-lg"
            style={{
              background: 'linear-gradient(90deg, #FFD700 0%, #bfa14a 50%, #FFD700 100%)',
              border: '3px solid #bfa14a',
              boxShadow: '0 2px 8px #0005, 0 0px 0px #fff8 inset',
            }}
          />
        </div>

        {/* Rods and beads */}
        <div className="absolute left-0 top-0 w-full h-full flex justify-between px-16" style={{ zIndex: 5 }}>
          {abacusState.map((rod, rodIndex) => (
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
                  height: FRAME_HEIGHT - 10, // Increased height to better match larger frame
                  width: ROD_WIDTH,
                  background: 'linear-gradient(to bottom, #FFD700 0%, #654321 100%)',
                  borderRadius: 6,
                  zIndex: 1,
                  boxShadow: '0 0 8px #0003',
                }}
              />

              {/* Upper bead (Heaven bead) */}
              <div
                className={`absolute w-9 h-9 rounded-full cursor-pointer shadow-lg border-2 flex items-center justify-center ${
                  rod.upperBead.isActive
                    ? 'bg-gradient-to-b from-[#FFD700] to-[#bfa14a] border-[#bfa14a]'
                    : 'bg-gradient-to-b from-[#fffbe6] to-[#8B4513] border-[#654321] hover:brightness-110'
                }`}
                onClick={() => toggleUpperBead(rodIndex)}
                style={{
                  left: '50%',
                  transform: 'translateX(-50%)',
                  top: rod.upperBead.isActive ? BEAM_Y - BEAD_SIZE - 6 : 16,
                  boxShadow: '0 4px 12px #0006',
                  zIndex: 15,
                }}
              >
                <div className="w-4 h-2 rounded-full bg-white opacity-30" />
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
                    className={`absolute w-9 h-9 rounded-full cursor-pointer shadow-lg border-2 flex items-center justify-center ${
                      isActive
                        ? 'bg-gradient-to-b from-[#FFD700] to-[#bfa14a] border-[#bfa14a]'
                        : 'bg-gradient-to-b from-[#fffbe6] to-[#8B4513] border-[#654321] hover:brightness-110'
                    }`}
                    onClick={() => toggleLowerBeads(rodIndex, beadIndex + 1)}
                    style={{
                      left: '50%',
                      transform: 'translateX(-50%)',
                      top,
                      boxShadow: '0 4px 12px #0006',
                      zIndex: 15,
                    }}
                  >
                    <div className="w-4 h-2 rounded-full bg-white opacity-30" />
                  </div>
                );
              })}

                              {/* Position labels */}
                <div
                  className="text-sm text-[#FFD700] font-mono font-bold whitespace-nowrap bg-black/70 px-2 py-1 rounded shadow-lg"
                  style={{
                    position: 'absolute',
                    bottom: -45,
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
            
            {/* Controls Sidebar */}
            <div className="flex flex-col gap-4 min-w-[80px]">
              <button 
                onClick={resetAbacus}
                className="bg-[#080808]/80 hover:bg-[#191919] text-gold font-bold p-4 rounded-xl border border-gold/50 ring-1 ring-white/5 shadow-[0_8px_20px_rgba(0,0,0,0.45)] transition-all duration-200 backdrop-blur-md hover:shadow-[0_0_40px_rgba(255,186,8,0.25)] hover:scale-105 flex items-center justify-center"
                title="Reset Abacus"
              >
                🔄
              </button>
              <button 
                onClick={setRandomValue}
                className="bg-[#080808]/80 hover:bg-[#191919] text-gold font-bold p-4 rounded-xl border border-gold/50 ring-1 ring-white/5 shadow-[0_8px_20px_rgba(0,0,0,0.45)] transition-all duration-200 backdrop-blur-md hover:shadow-[0_0_40px_rgba(255,186,8,0.25)] hover:scale-105 flex items-center justify-center"
                title="Random Number"
              >
                🎲
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-[#080808]/80 hover:bg-[#191919] backdrop-blur-xl p-6 rounded-2xl border border-gold/40 ring-1 ring-white/5 shadow-xl transition-all duration-500 hover:border-gold hover:shadow-[0_0_40px_rgba(255,186,8,0.25)] relative overflow-hidden">
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-[#FFD700]/10 opacity-0 hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-gold mb-4 flex items-center">
              <span className="mr-2">📖</span>
              How to Use Soroban
            </h3>
            <ul className="text-sm text-gray-300 space-y-2">
              <li className="flex items-start">
                <span className="text-gold mr-2">•</span>
                <span><strong>Upper beads (Heaven):</strong> Click to toggle. Each represents 5 units when touching the beam</span>
              </li>
              <li className="flex items-start">
                <span className="text-gold mr-2">•</span>
                <span><strong>Lower beads (Earth):</strong> Click any bead to move that many beads to the beam. They move as a group.</span>
              </li>
              <li className="flex items-start">
                <span className="text-gold mr-2">•</span>
                <span><strong>Only beads touching the beam are counted</strong> in the calculation</span>
              </li>
              <li className="flex items-start">
                <span className="text-gold mr-2">•</span>
                <span><strong>Each rod represents a different place value</strong> (ones, tens, hundreds, etc.)</span>
              </li>
              <li className="flex items-start">
                <span className="text-gold mr-2">•</span>
                <span><strong>Use the controls</strong> to reset or generate random numbers</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
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
    <div className="min-h-screen">
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
              <div className="px-4 pt-2 tablet:p-6 desktop:p-8 space-y-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-black hover:bg-[#191919] transition-colors text-white p-8 rounded-2xl border border-gold/50 ring-1 ring-white/5 backdrop-blur-xl shadow-[0_12px_36px_rgba(0,0,0,0.65)] relative overflow-hidden">
                  {/* Subtle gold glow overlays */}
                  <div className="pointer-events-none absolute -inset-14 bg-[radial-gradient(circle_at_top_left,rgba(255,186,8,0.08),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(250,163,7,0.06),transparent_45%)]"></div>
                  {/* Glass highlight lines */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/10"></div>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-black/40"></div>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold via-lightGold to-gold"></div>
                  
                  <div className="relative z-10">
                    <h1 className="text-4xl font-bold mb-4 flex items-center text-white">
                      <span className="mr-3 text-4xl">🧮</span>
                      Virtual Soroban Abacus
                    </h1>
                    <p className="text-gray-300 text-lg">
                      Interactive soroban (Japanese abacus) tool for practicing mental math and calculations.
                    </p>
                  </div>
                </div>

                {/* Virtual Abacus Component */}
                <VirtualAbacus />

                {/* Features */}
                <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-6">
                  <div className="bg-[#080808]/80 hover:bg-[#191919] backdrop-blur-xl p-6 rounded-2xl border border-gold/40 ring-1 ring-white/5 shadow-xl transition-all duration-500 hover:border-gold hover:shadow-[0_0_40px_rgba(255,186,8,0.25)] group relative overflow-hidden">
                    {/* Glassmorphism overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-[#FFD700]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                    <div className="relative z-10">
                      <h3 className="text-lg font-bold mb-3 text-gold flex items-center">
                        <span className="mr-2">🎯</span>
                        Proper Soroban Logic
                      </h3>
                      <p className="text-gray-300 text-sm">
                        Follows authentic soroban rules with heaven beads (5 units) and earth beads (1 unit each) that move as groups.
                      </p>
                    </div>
                  </div>
                  <div className="bg-[#080808]/80 hover:bg-[#191919] backdrop-blur-xl p-6 rounded-2xl border border-gold/40 ring-1 ring-white/5 shadow-xl transition-all duration-500 hover:border-gold hover:shadow-[0_0_40px_rgba(255,186,8,0.25)] group relative overflow-hidden">
                    {/* Glassmorphism overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-[#FFD700]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                    <div className="relative z-10">
                      <h3 className="text-lg font-bold mb-3 text-gold flex items-center">
                        <span className="mr-2">⚡</span>
                        Real-time Calculation
                      </h3>
                      <p className="text-gray-300 text-sm">
                        Only beads touching the beam are counted, providing accurate soroban calculations.
                      </p>
                    </div>
                  </div>
                  <div className="bg-[#080808]/80 hover:bg-[#191919] backdrop-blur-xl p-6 rounded-2xl border border-gold/40 ring-1 ring-white/5 shadow-xl transition-all duration-500 hover:border-gold hover:shadow-[0_0_40px_rgba(255,186,8,0.25)] group relative overflow-hidden">
                    {/* Glassmorphism overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-[#FFD700]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                    <div className="relative z-10">
                      <h3 className="text-lg font-bold mb-3 text-gold flex items-center">
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
  );
};

export default StudentVirtualAbacusPage;