import { FC } from 'react';

import LevelCard from '@components/molecules/LevelCard';

import { LevelsPercentage } from '@interfaces/apis/student';

export interface RoadmapSectionProps {
  currentLevel: number;
  currentClass: number;
  progress: LevelsPercentage;
}

const RoadmapSection: FC<RoadmapSectionProps> = ({
  currentLevel,
  currentClass,
  progress,
}) => {
  const classCards = [];

  for (let i = 1; i < 11; i += 1) {
    if (currentLevel > i) {
      if (progress[i] !== 100) {
        classCards.push(
          <LevelCard
            key={i}
            type="inprogress"
            description="Conquests Incomplete"
            progress={progress[i]}
            level={i}
          />
        );
      } else {
        classCards.push(
          <LevelCard
            key={i}
            type="finished"
            description="Conquests Completed"
            level={i}
          />
        );
      }
    } else if (currentLevel === i) {
      classCards.push(
        <LevelCard
          key={i}
          type="inprogress"
          description={`Conquest ${currentClass}`}
          progress={progress[currentLevel]}
          level={i}
        />
      );
    } else {
      classCards.push(
        <LevelCard key={i} type="locked" description="Conquest Locked" level={i} />
      );
    }
  }

  return (
    <div className="px-6 tablet:p-10 desktop:px-24">
      <p className="font-medium text-md desktop:text-lg" style={{ color: '#ffffff' }}>Path of Conquest</p>
      <div className="grid grid-cols-1 gap-10 tablet:grid-cols-2 desktop:grid-cols-3">
        {classCards}
      </div>
    </div>
  );
};

export default RoadmapSection;
