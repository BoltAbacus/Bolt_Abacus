import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  message?: string;
  progress?: number;
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

const colorClasses = {
  primary: 'text-blue-600',
  secondary: 'text-gray-600',
  white: 'text-white',
  gray: 'text-gray-400',
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  message,
  progress,
  className = '',
}) => {
  const sizeClass = sizeClasses[size];
  const colorClass = colorClasses[color];

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        {/* Spinner */}
        <div
          className={`animate-spin rounded-full border-2 border-gray-200 ${sizeClass} ${colorClass.replace('text-', 'border-')}`}
          style={{
            borderTopColor: 'currentColor',
          }}
        >
          <div className="sr-only">Loading...</div>
        </div>
        
        {/* Progress indicator */}
        {progress !== undefined && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium" style={{ color: 'currentColor' }}>
              {Math.round(progress)}%
            </span>
          </div>
        )}
      </div>
      
      {/* Message */}
      {message && (
        <p className="mt-2 text-sm text-gray-600 text-center max-w-xs">
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
