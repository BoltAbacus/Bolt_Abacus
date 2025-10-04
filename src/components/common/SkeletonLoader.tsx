import { FC } from 'react';

interface SkeletonLoaderProps {
  lines?: number;
  className?: string;
}

export const SkeletonLoader: FC<SkeletonLoaderProps> = ({ 
  lines = 3, 
  className = "" 
}) => {
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <div className="rounded-full bg-gray-300 h-4 w-4"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton: FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-gray-300 h-6 rounded w-1/3 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  );
};

export const ProgressSkeleton: FC = () => {
  return (
    <div className="animate-pulse space-y-6">
      {/* stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-gray-100 p-4 rounded-lg">
            <div className="h-8 bg-gray-300 rounded w-1/2 mb-2"></div>
            <div className="h-12 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
      
      {/* progress chart skeleton */}
      <div className="bg-gray-100 p-6 rounded-lg">
        <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};