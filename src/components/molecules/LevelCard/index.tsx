import { FC } from 'react';
import { Link } from 'react-router-dom';
import { BsCheckCircleFill } from 'react-icons/bs';
import { LuCircleDashed } from 'react-icons/lu';

import Button from '@components/atoms/Button';
import LockIcon from '@components/atoms/LockIcon';
import ProgressBar from '@components/atoms/ProgressBar';

import { STUDENT_LEVEL } from '@constants/routes';
import { getLevelName } from '@helpers/levelNames';

import styles from './index.module.css';

export interface LevelCardProps {
  type: 'finished' | 'inprogress' | 'locked';
  level: number;
  description: string;
  progress?: number;
}

const LevelCard: FC<LevelCardProps> = ({
  type,
  level,
  description,
  progress,
}) => {
  return (
    <div
      className="relative p-6 rounded-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,186,8,0.4),0_0_40px_rgba(255,186,8,0.2),0_0_60px_rgba(255,186,8,0.1)] hover:shadow-gold/30"
      style={{ backgroundColor: '#161618' }}
    >
      <div className="flex items-center justify-between">
        {type === 'locked' && (
          <div className="absolute top-0 bottom-0 left-0 right-0 z-10 flex items-center justify-center font-bold text-coal bg-white/90">
            <LockIcon />
          </div>
        )}
        <p className="text-sm font-semibold desktop:text-md" style={{ color: '#ffffff' }}>{getLevelName(level)}</p>
        {type === 'finished' && (
          <div className="flex items-center gap-1 text-sm font-medium desktop:text-md" style={{ color: '#818181' }}>
            <p>Finished</p>
            <BsCheckCircleFill className="text-sm desktop:text-md" />
          </div>
        )}
        {type === 'inprogress' && (
          <div className="flex items-center gap-1 text-sm font-medium desktop:text-md" style={{ color: '#818181' }}>
            <p>In Progress</p>
            <LuCircleDashed className="text-sm desktop:text-md" style={{ color: '#818181' }} />
          </div>
        )}
      </div>
      <div className="">
        <p className="py-2 font-medium text-md desktop:text-lg" style={{ color: '#818181' }}>
          {description}
        </p>
        {type === 'finished' && (
          <>
            <ProgressBar type="blue" percentage={100} />
            <div className="pt-6">
              <Link to={`${STUDENT_LEVEL}/${level}`}>
                <Button type="black" text="View Level" />
              </Link>
            </div>
          </>
        )}
        {type === 'inprogress' && (
          <>
            <ProgressBar type="green" percentage={progress!} />
            <div className="pt-6">
              <Link to={`${STUDENT_LEVEL}/${level}`}>
                <Button type="primary" text="Resume Learning" />
              </Link>
            </div>
          </>
        )}
        {type === 'locked' && (
          <>
            <ProgressBar type="blue" percentage={0} />
            <div className="pt-6">
              <Button type="primary" text="Start Learning" />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LevelCard;
