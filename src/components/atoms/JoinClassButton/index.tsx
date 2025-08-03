import { FC } from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineVideoCamera } from 'react-icons/ai';

import Button from '@components/atoms/Button';

export interface JoinClassButtonProps {
  classLink: string;
  className?: string;
}

const JoinClassButton: FC<JoinClassButtonProps> = ({ classLink, className = '' }) => {
  return (
    <div className={className}>
      <Link to={classLink} target="_blank" className="block">
        <Button 
          text="Join Class" 
          type="blue" 
          className="flex items-center justify-center space-x-2 w-full h-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
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