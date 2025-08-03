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
  const [value, setValue] = useState(0);
  const [displayValue, setDisplayValue] = useState('0');
  
  // Soroban layout constants
  const ROD_COUNT = 13;
  const FRAME_HEIGHT = 320; // Increased from 240
  const FRAME_WIDTH = 900; // Increased from 700
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
    const newState = rods.map((rod, rodIndex) => {
      const position = 12 - rodIndex;
      const digit = Math.floor(randomValue / Math.pow(10, position)) % 10;
      
      const upperBead = { isActive: digit >= 5 };
      const lowerBeads = { count: digit >= 5 ? digit - 5 : digit };
      
      return { rodIndex, upperBead, lowerBeads };
    });
    
    setAbacusState(newState);
  };

  return (
    <div className="bg-[#1b1b1b] text-white p-6 rounded-lg border border-gray-800">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <span className="mr-2">🧮</span>
        Interactive Soroban Abacus
      </h2>
      
      {/* Display */}
      <div className="bg-black p-4 rounded-lg mb-6 border-2 border-[#8B4513]">
        <div className="text-right text-3xl font-mono text-[#FFD700]">
          {displayValue}
        </div>
      </div>

      {/* Abacus Frame */}
      <div
        className="relative mx-auto bg-gradient-to-b from-[#d4a574] to-[#8B4513] rounded-2xl border-8 border-[#654321] shadow-2xl"
        style={{ height: FRAME_HEIGHT, width: FRAME_WIDTH }}
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
              style={{ height: FRAME_HEIGHT, width: BEAD_SIZE + 8 }}
            >
              {/* Rod */}
              <div
                className="absolute left-1/2 -translate-x-1/2"
                style={{
                  top: 0,
                  height: FRAME_HEIGHT - 24,
                  width: ROD_WIDTH,
                  background: 'linear-gradient(to bottom, #FFD700 0%, #654321 100%)',
                  borderRadius: 6,
                  zIndex: 1,
                  boxShadow: '0 0 8px #0003',
                }}
              />

              {/* Upper bead (Heaven bead) */}
              <div
                className={`absolute w-9 h-9 rounded-full cursor-pointer transition-all duration-300 shadow-lg border-2 flex items-center justify-center ${
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
                  transition: 'top 0.3s cubic-bezier(.4,2,.6,1)',
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
                  top = BEAM_Y + 12 + (activePosition * BEAD_SPACING);
                } else {
                  // Inactive beads rest at the bottom, stacked from bottom up
                  const inactivePosition = 4 - beadIndex - 1;
                  top = FRAME_HEIGHT - BEAD_SIZE - 16 - (inactivePosition * BEAD_SPACING);
                }
                
                return (
                  <div
                    key={beadIndex}
                    className={`absolute w-9 h-9 rounded-full cursor-pointer transition-all duration-300 shadow-lg border-2 flex items-center justify-center ${
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
                      transition: 'top 0.3s cubic-bezier(.4,2,.6,1)',
                      zIndex: 15,
                    }}
                  >
                    <div className="w-4 h-2 rounded-full bg-white opacity-30" />
                  </div>
                );
              })}

              {/* Position labels */}
              <div
                className="text-sm text-[#FFD700] font-mono font-bold"
                style={{
                  position: 'absolute',
                  bottom: -32,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  textShadow: '0 1px 2px #000a',
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

      {/* Controls */}
      <div className="flex justify-center space-x-4 mt-6">
        <button 
          onClick={resetAbacus}
          className="bg-[#8B4513] hover:bg-[#654321] text-[#FFD700] px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Reset
        </button>
        <button 
          onClick={setRandomValue}
          className="bg-[#8B4513] hover:bg-[#654321] text-[#FFD700] px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Random Number
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-black rounded-lg border border-[#8B4513]">
        <h3 className="text-lg font-semibold text-[#FFD700] mb-2">How to Use Soroban:</h3>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• <strong>Upper beads (Heaven):</strong> Click to toggle. Each represents 5 units when touching the beam</li>
          <li>• <strong>Lower beads (Earth):</strong> Click any bead to move that many beads to the beam. They move as a group.</li>
          <li>• <strong>Only beads touching the beam are counted</strong> in the calculation</li>
          <li>• <strong>Each rod represents a different place value</strong> (ones, tens, hundreds, etc.)</li>
          <li>• <strong>Use the controls</strong> to reset or generate random numbers</li>
        </ul>
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
  const { incrementStreak } = useStreakStore();

  useEffect(() => {
    const getDashboardData = async () => {
      if (isAuthenticated) {
        try {
          const res = await dashboardRequestV2(authToken!);
          if (res.status === 200) {
            setApiError(null);
            incrementStreak();
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
  }, [authToken, isAuthenticated, incrementStreak]);

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
              <div className="px-6 pt-2 tablet:p-10 desktop:px-24 space-y-6">
                {/* Header */}
                <div className="bg-[#1b1b1b] text-white p-6 rounded-lg border border-gray-800">
                  <h1 className="text-3xl font-bold mb-4 flex items-center">
                    <span className="mr-2">🧮</span>
                    Virtual Soroban Abacus
                  </h1>
                  <p className="text-gray-300">
                    Interactive soroban (Japanese abacus) tool for practicing mental math and calculations.
                  </p>
                </div>

                {/* Virtual Abacus Component */}
                <VirtualAbacus />

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-[#1b1b1b] text-white p-6 rounded-lg border border-gray-800">
                    <h3 className="text-lg font-semibold mb-2 text-[#FFD700]">Proper Soroban Logic</h3>
                    <p className="text-gray-300 text-sm">
                      Follows authentic soroban rules with heaven beads (5 units) and earth beads (1 unit each) that move as groups.
                    </p>
                  </div>
                  <div className="bg-[#1b1b1b] text-white p-6 rounded-lg border border-gray-800">
                    <h3 className="text-lg font-semibold mb-2 text-[#FFD700]">Real-time Calculation</h3>
                    <p className="text-gray-300 text-sm">
                      Only beads touching the beam are counted, providing accurate soroban calculations.
                    </p>
                  </div>
                  <div className="bg-[#1b1b1b] text-white p-6 rounded-lg border border-gray-800">
                    <h3 className="text-lg font-semibold mb-2 text-[#FFD700]">Educational Tool</h3>
                    <p className="text-gray-300 text-sm">
                      Perfect for learning traditional abacus techniques and mental math skills.
                    </p>
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