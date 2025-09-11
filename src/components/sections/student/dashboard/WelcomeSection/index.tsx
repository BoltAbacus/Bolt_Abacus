import { FC } from 'react';
import { useAuthStore } from '@store/authStore';

export interface WelcomeSectionProps {
  currentLevel: number;
  currentClass: number;
}

const WelcomeSection: FC<WelcomeSectionProps> = ({ currentLevel, currentClass }) => {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="bg-[#1b1b1b] text-white p-6 rounded-lg">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.name.first || 'Student'}! 
        </h1>
        <p className="text-gray-300">
          You're currently in Level {currentLevel}, Class {currentClass}
        </p>
      </div>
    </div>
  );
};

export default WelcomeSection;
