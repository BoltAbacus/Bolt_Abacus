import { FC } from 'react';
import { Link } from 'react-router-dom';
import { FaPlay } from 'react-icons/fa';

export interface PracticeCardProps {
  title: string;
  image: string;
  description: string;
  link: string;
  color: 'blue' | 'green' | 'pink' | 'red' | 'purple' | 'gold' | 'orange' | 'indigo';
}

const PracticeCard: FC<PracticeCardProps> = ({
  title,
  image,
  description,
  link,
  color,
}) => {
  const getColorClasses = (color: string) => {
    // All cards use the same solid Apple color background
    return '';
  };

  return (
    <Link
      to={link}
      className="group relative p-4 rounded-2xl w-full text-white transition-all duration-300 hover:transform hover:scale-105 hover:shadow-lg"
      style={{ backgroundColor: '#161618' }}
    >
      {/* Main Content - Horizontal Layout */}
      <div className="flex items-center gap-4 h-20">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="relative w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300" style={{ backgroundColor: '#212124' }}>
            <img
              src={image}
              alt={title}
              className="w-8 h-8 object-cover group-hover:scale-110 transition-transform duration-300 filter brightness-0 invert"
            />
          </div>
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-base transition-colors duration-300 mb-1 truncate" style={{ color: '#ffffff' }}>
            {title}
          </h2>
          <p className="text-xs leading-tight transition-colors duration-300 line-clamp-2" style={{ color: '#818181' }}>
            {description}
          </p>
        </div>

        {/* Start Game Button */}
        <div className="flex-shrink-0">
          <div className="bg-gradient-to-r from-gold to-lightGold group-hover:from-lightGold group-hover:to-gold text-black font-bold py-2 px-4 rounded-lg transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-lg flex items-center gap-2">
            <FaPlay className="w-3 h-3" />
            <span className="text-sm">Start Game</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PracticeCard;
