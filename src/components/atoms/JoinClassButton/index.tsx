import { FC } from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineVideoCamera } from 'react-icons/ai';

import Button from '@components/atoms/Button';
import { useGoalsStore } from '@store/goalsStore';

export interface JoinClassButtonProps {
  classLink: string;
  className?: string;
}

const JoinClassButton: FC<JoinClassButtonProps> = ({ classLink, className = '' }) => {
  const { markSessionCompleted } = useGoalsStore();

  const handleClick = () => {
    // Mark a session as completed when the user joins class
    markSessionCompleted();
  };

  return (
    <div className={className}>
      <Link to={classLink} target="_blank" className="block" onClick={handleClick}>
        <Button 
          text="Join Class" 
          type="primary" 
          className="flex items-center justify-center space-x-2 w-full h-full"
        >
          <div className="flex items-center space-x-2">
            <AiOutlineVideoCamera size={16} />
            <span>Join Class</span>
          </div>
        </Button>
      </Link>
    </div>
  );
};

export default JoinClassButton; 