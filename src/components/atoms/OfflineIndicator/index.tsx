import React, { useState, useEffect } from 'react';
import { useOffline } from '@hooks/useOffline';

interface OfflineIndicatorProps {
  className?: string;
  showWhenOnline?: boolean;
  position?: 'top' | 'bottom' | 'fixed-top' | 'fixed-bottom';
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  className = '',
  showWhenOnline = false,
  position = 'fixed-top',
}) => {
  const { isOffline, wasOffline } = useOffline();
  const [show, setShow] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    if (isOffline) {
      setShow(true);
      setIsReconnecting(false);
    } else if (wasOffline) {
      setIsReconnecting(true);
      // Hide after showing reconnected message
      setTimeout(() => {
        setShow(false);
        setIsReconnecting(false);
      }, 3000);
    } else if (showWhenOnline && !isOffline) {
      setShow(true);
      setTimeout(() => setShow(false), 2000);
    }
  }, [isOffline, wasOffline, showWhenOnline]);

  if (!show) return null;

  const positionClasses = {
    'top': 'top-0',
    'bottom': 'bottom-0',
    'fixed-top': 'fixed top-0 left-0 right-0 z-50',
    'fixed-bottom': 'fixed bottom-0 left-0 right-0 z-50',
  };

  const getStatusInfo = () => {
    if (isReconnecting) {
      return {
        message: 'Connection restored!',
        icon: '✅',
        bgColor: 'bg-green-500',
        textColor: 'text-white',
      };
    }
    
    if (isOffline) {
      return {
        message: 'You are offline. Some features may be limited.',
        icon: '⚠️',
        bgColor: 'bg-yellow-500',
        textColor: 'text-white',
      };
    }
    
    return {
      message: 'You are online',
      icon: '🌐',
      bgColor: 'bg-blue-500',
      textColor: 'text-white',
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <div
      className={`${positionClasses[position]} ${statusInfo.bgColor} ${statusInfo.textColor} px-4 py-2 shadow-lg transition-all duration-300 ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center justify-center space-x-2">
        <span className="text-lg">{statusInfo.icon}</span>
        <span className="text-sm font-medium">{statusInfo.message}</span>
        {isReconnecting && (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;
