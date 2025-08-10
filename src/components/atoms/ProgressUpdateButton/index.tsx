import { FC } from 'react';
import { usePracticeContext } from '../../../contexts/PracticeContext';

interface ProgressUpdateButtonProps {
  isCorrect: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const ProgressUpdateButton: FC<ProgressUpdateButtonProps> = ({
  isCorrect,
  children,
  className = '',
  onClick,
}) => {
  const { updateProgress } = usePracticeContext();

  const handleClick = () => {
    updateProgress(isCorrect);
    if (onClick) {
      onClick();
    }
  };

  return (
    <button
      className={className}
      onClick={handleClick}
      type="button"
    >
      {children}
    </button>
  );
};

export default ProgressUpdateButton;
