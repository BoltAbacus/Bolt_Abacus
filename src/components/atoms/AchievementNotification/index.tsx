import { FC, useEffect, useState } from 'react';
import { FaTrophy, FaStar, FaMedal, FaCrown, FaRocket, FaCheckCircle } from 'react-icons/fa';
import { BiTargetLock } from 'react-icons/bi';
import { useAchievementStore } from '@store/achievementStore';

export interface AchievementNotificationProps {
  className?: string;
}

const AchievementNotification: FC<AchievementNotificationProps> = ({ className = '' }) => {
  const { getUnlockedAchievements } = useAchievementStore();
  const [showNotification, setShowNotification] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<any>(null);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);

  useEffect(() => {
    const achievements = getUnlockedAchievements();
    const newUnlockedIds = achievements.map(a => a.id);
    
    // Check for newly unlocked achievements
    const newlyUnlocked = newUnlockedIds.filter(id => !unlockedAchievements.includes(id));
    
    if (newlyUnlocked.length > 0) {
      const achievement = achievements.find(a => a.id === newlyUnlocked[0]);
      if (achievement) {
        setCurrentAchievement(achievement);
        setShowNotification(true);
        
        // Hide notification after 5 seconds
        setTimeout(() => {
          setShowNotification(false);
        }, 5000);
      }
    }
    
    setUnlockedAchievements(newUnlockedIds);
  }, [getUnlockedAchievements]);

  const getIcon = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      'FaTrophy': FaTrophy,
      'FaStar': FaStar,
      'FaMedal': FaMedal,
      'FaCrown': FaCrown,
      'FaRocket': FaRocket,
      'FaCheckCircle': FaCheckCircle,
      'BiTargetLock': BiTargetLock,
    };
    return iconMap[iconName] || FaStar;
  };

  if (!showNotification || !currentAchievement) {
    return null;
  }

  const IconComponent = getIcon(currentAchievement.icon);

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4 rounded-lg shadow-lg border border-yellow-400 animate-bounce">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <IconComponent className="text-yellow-600 text-xl" />
          </div>
          <div>
            <h4 className="text-white font-bold text-lg">Achievement Unlocked!</h4>
            <p className="text-white text-sm">{currentAchievement.title}</p>
            <p className="text-yellow-100 text-xs">{currentAchievement.description}</p>
          </div>
        </div>
        <button
          onClick={() => setShowNotification(false)}
          className="absolute top-2 right-2 text-white hover:text-yellow-200"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default AchievementNotification; 