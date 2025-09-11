import React from 'react';
import LoadingSpinner from '../LoadingSpinner';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  progress?: number;
  children: React.ReactNode;
  className?: string;
  overlayClassName?: string;
  spinnerSize?: 'sm' | 'md' | 'lg' | 'xl';
  spinnerColor?: 'primary' | 'secondary' | 'white' | 'gray';
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message,
  progress,
  children,
  className = '',
  overlayClassName = '',
  spinnerSize = 'lg',
  spinnerColor = 'white',
}) => {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div className={`relative ${className}`}>
      {children}
      <div
        className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${overlayClassName}`}
        role="dialog"
        aria-modal="true"
        aria-label="Loading"
      >
        <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full mx-4">
          <LoadingSpinner
            size={spinnerSize}
            color="primary"
            message={message}
            progress={progress}
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
