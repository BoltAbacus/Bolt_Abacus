import React, { FC, useEffect, useState } from 'react';
import { useStreakStore } from '@store/streakStore';
import { useAuthStore } from '@store/authStore';

export interface StreakTestProps {
  className?: string;
}

const StreakTest: FC<StreakTestProps> = ({ className = '' }) => {
  const { currentStreak, maxStreak, isLoading, error, fetchStreak, updateStreak, resetStreak } = useStreakStore();
  const { authToken, isAuthenticated } = useAuthStore();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const runTests = async () => {
    setTestResults([]);
    addTestResult('Starting streak system tests...');

    if (!isAuthenticated || !authToken) {
      addTestResult('❌ Not authenticated - cannot run tests');
      return;
    }

    try {
      // Test 1: Fetch current streak
      addTestResult('Test 1: Fetching current streak...');
      await fetchStreak();
      addTestResult(`✅ Current streak: ${currentStreak}, Max streak: ${maxStreak}`);

      // Test 2: Update streak
      addTestResult('Test 2: Updating streak...');
      await updateStreak();
      addTestResult(`✅ Streak updated: ${currentStreak}, Max streak: ${maxStreak}`);

      // Test 3: Fetch again to verify
      addTestResult('Test 3: Fetching streak again...');
      await fetchStreak();
      addTestResult(`✅ Streak fetched: ${currentStreak}, Max streak: ${maxStreak}`);

      addTestResult('🎉 All tests completed successfully!');
    } catch (error) {
      addTestResult(`❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchStreak();
    }
  }, [isAuthenticated, fetchStreak]);

  if (!isAuthenticated) {
    return (
      <div className={`bg-red-900/20 border border-red-500/50 p-4 rounded-lg ${className}`}>
        <h3 className="text-red-400 font-bold mb-2">Streak System Test</h3>
        <p className="text-red-300 text-sm">Please log in to test the streak system</p>
      </div>
    );
  }

  return (
    <div className={`bg-[#080808]/80 border border-gold/50 p-4 rounded-lg ${className}`}>
      <h3 className="text-gold font-bold mb-4">Streak System Test</h3>
      
      <div className="mb-4">
        <div className="flex items-center space-x-4 mb-2">
          <span className="text-white">Current Streak:</span>
          <span className="text-gold font-bold">{isLoading ? '...' : currentStreak}</span>
        </div>
        <div className="flex items-center space-x-4 mb-2">
          <span className="text-white">Max Streak:</span>
          <span className="text-gold font-bold">{isLoading ? '...' : maxStreak}</span>
        </div>
        {error && (
          <div className="text-red-400 text-sm mt-2">
            Error: {error}
          </div>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <button
          onClick={runTests}
          disabled={isLoading}
          className="bg-gold text-black px-4 py-2 rounded font-bold hover:bg-yellow-400 disabled:opacity-50"
        >
          {isLoading ? 'Running Tests...' : 'Run Tests'}
        </button>
        <button
          onClick={updateStreak}
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 disabled:opacity-50 ml-2"
        >
          Update Streak
        </button>
        <button
          onClick={resetStreak}
          disabled={isLoading}
          className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700 disabled:opacity-50 ml-2"
        >
          Reset Streak
        </button>
      </div>

      {testResults.length > 0 && (
        <div className="bg-black/50 p-3 rounded border border-gray-600">
          <h4 className="text-white font-bold mb-2">Test Results:</h4>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className="text-xs text-gray-300">
                {result}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StreakTest;
