import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: 'chars' | 'words' | 'lines' | 'chars,words' | 'chars,lines' | 'words,lines' | 'chars,words,lines';
  from?: { opacity?: number; y?: number; [key: string]: any };
  to?: { opacity?: number; y?: number; [key: string]: any };
  threshold?: number;
  rootMargin?: string;
  textAlign?: 'left' | 'center' | 'right';
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';
  onLetterAnimationComplete?: () => void;
}

const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = '',
  delay = 100,
  duration = 0.6,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  textAlign = 'center',
  tag = 'p',
  onLetterAnimationComplete
}) => {
  const ref = useRef<HTMLElement>(null);
  const animationCompletedRef = useRef(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    if (document.fonts.status === 'loaded') {
      setFontsLoaded(true);
    } else {
      document.fonts.ready.then(() => {
        setFontsLoaded(true);
      });
    }
  }, []);

  useEffect(() => {
    if (!ref.current || !text || !fontsLoaded) return;
    const el = ref.current;

    // Clear any existing content
    el.innerHTML = '';

    // Split text based on splitType
    let elements: HTMLElement[] = [];
    
    if (splitType === 'chars') {
      // Split into individual characters
      elements = text.split('').map((char, index) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char; // Non-breaking space for regular spaces
        span.style.display = 'inline-block';
        span.style.opacity = '0';
        span.style.transform = `translateY(${from.y || 40}px)`;
        span.style.willChange = 'transform, opacity';
        return span;
      });
    } else if (splitType === 'words') {
      // Split into words
      elements = text.split(' ').map((word, index) => {
        const span = document.createElement('span');
        span.textContent = word;
        span.style.display = 'inline-block';
        span.style.marginRight = '0.25em';
        span.style.opacity = '0';
        span.style.transform = `translateY(${from.y || 40}px)`;
        span.style.willChange = 'transform, opacity';
        return span;
      });
    } else {
      // Default to chars
      elements = text.split('').map((char, index) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.display = 'inline-block';
        span.style.opacity = '0';
        span.style.transform = `translateY(${from.y || 40}px)`;
        span.style.willChange = 'transform, opacity';
        return span;
      });
    }

    // Append elements to the container
    elements.forEach(element => el.appendChild(element));

    // Animate elements immediately on mount
    const tween = gsap.fromTo(
      elements,
      { ...from },
      {
        ...to,
        duration,
        ease,
        stagger: delay / 1000,
        onComplete: () => {
          animationCompletedRef.current = true;
          onLetterAnimationComplete?.();
        },
        willChange: 'transform, opacity',
        force3D: true
      }
    );

    return () => {
      tween.kill();
    };
  }, [
    text,
    delay,
    duration,
    ease,
    splitType,
    JSON.stringify(from),
    JSON.stringify(to),
    fontsLoaded,
    onLetterAnimationComplete
  ]);

  const renderTag = () => {
    const style: React.CSSProperties = {
      textAlign,
      overflow: 'hidden',
      display: 'inline-block',
      whiteSpace: 'normal',
      wordWrap: 'break-word',
      willChange: 'transform, opacity'
    };
    const classes = `split-parent ${className}`;
    
    const commonProps = {
      ref: ref as any,
      style,
      className: classes
    };

    switch (tag) {
      case 'h1':
        return <h1 {...commonProps}>{text}</h1>;
      case 'h2':
        return <h2 {...commonProps}>{text}</h2>;
      case 'h3':
        return <h3 {...commonProps}>{text}</h3>;
      case 'h4':
        return <h4 {...commonProps}>{text}</h4>;
      case 'h5':
        return <h5 {...commonProps}>{text}</h5>;
      case 'h6':
        return <h6 {...commonProps}>{text}</h6>;
      default:
        return <p {...commonProps}>{text}</p>;
    }
  };
  
  return renderTag();
};

export default SplitText;
