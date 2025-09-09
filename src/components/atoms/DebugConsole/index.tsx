import { FC, useState, useEffect } from 'react';
import { useAuthStore } from '@store/authStore';
import { useStreakStore } from '@store/streakStore';

export interface DebugConsoleProps {
  className?: string;
}

const DebugConsole: FC<DebugConsoleProps> = ({ className = '' }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const { authToken, isAuthenticated, user } = useAuthStore();
  const { currentStreak, maxStreak, isLoading, error } = useStreakStore();

  useEffect(() => {
    // Capture console logs
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const toText = (args: unknown[]) => {
      return args
        .map((arg) => {
          try {
            if (typeof arg === 'string') return arg;
            if (arg instanceof Error) {
              return JSON.stringify({ name: arg.name, message: arg.message, stack: arg.stack });
            }
            return JSON.stringify(arg);
          } catch {
            return String(arg);
          }
        })
        .join(' ');
    };

    console.log = (...args) => {
      originalLog(...args);
      setLogs(prev => [...prev.slice(-49), `[LOG] ${toText(args)}`]);
    };

    console.error = (...args) => {
      originalError(...args);
      setLogs(prev => [...prev.slice(-49), `[ERROR] ${toText(args)}`]);
    };

    console.warn = (...args) => {
      originalWarn(...args);
      setLogs(prev => [...prev.slice(-49), `[WARN] ${toText(args)}`]);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  const clearLogs = () => setLogs([]);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className={`fixed bottom-4 right-4 bg-red-600 text-white p-2 rounded-full shadow-lg z-50 ${className}`}
        title="Open Debug Console"
      >
        🐛
      </button>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg shadow-lg z-50 max-w-md max-h-96 overflow-hidden ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-bold">Debug Console</h3>
        <div className="flex gap-2">
          <button
            onClick={clearLogs}
            className="text-xs bg-red-600 px-2 py-1 rounded"
          >
            Clear
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-xs bg-gray-600 px-2 py-1 rounded"
          >
            Close
          </button>
        </div>
      </div>
      
      <div className="text-xs mb-2 space-y-1">
        <div>Auth: {isAuthenticated ? '✅' : '❌'}</div>
        <div>Token: {authToken ? '✅' : '❌'}</div>
        <div>User: {user?.name?.first || 'N/A'}</div>
        <div>Streak: {currentStreak} (Max: {maxStreak})</div>
        <div>Loading: {isLoading ? '⏳' : '✅'}</div>
        {error && <div className="text-red-400">Error: {error}</div>}
      </div>

      <div className="bg-gray-900 p-2 rounded text-xs max-h-48 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="text-gray-400">No logs yet...</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="mb-1 break-words">
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DebugConsole;
