import { FC, useEffect, useRef, useState, ReactNode } from 'react';

interface ScrollAnimationProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
}

const ScrollAnimation: FC<ScrollAnimationProps> = ({ 
  children, 
  className = '', 
  delay = 0,
  direction = 'up',
  distance = 20 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [delay]);

  const getTransformClass = () => {
    switch (direction) {
      case 'up':
        return isVisible ? 'translate-y-0' : `translate-y-${distance}`;
      case 'down':
        return isVisible ? 'translate-y-0' : `-translate-y-${distance}`;
      case 'left':
        return isVisible ? 'translate-x-0' : `translate-x-${distance}`;
      case 'right':
        return isVisible ? 'translate-x-0' : `-translate-x-${distance}`;
      default:
        return isVisible ? 'translate-y-0' : `translate-y-${distance}`;
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`transition-all duration-500 ease-out ${getTransformClass()} ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default ScrollAnimation;
