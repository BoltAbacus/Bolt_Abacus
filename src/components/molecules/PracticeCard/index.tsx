import { FC } from 'react';
import { Link } from 'react-router-dom';

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
    switch (color) {
      case 'blue':
        return 'bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-200/50 hover:border-blue-400/50 hover:shadow-blue-500/20';
      case 'green':
        return 'bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-200/50 hover:border-green-400/50 hover:shadow-green-500/20';
      case 'pink':
        return 'bg-gradient-to-br from-pink-500/10 to-pink-600/10 border-pink-200/50 hover:border-pink-400/50 hover:shadow-pink-500/20';
      case 'red':
        return 'bg-gradient-to-br from-red-500/10 to-red-600/10 border-red-200/50 hover:border-red-400/50 hover:shadow-red-500/20';
      case 'purple':
        return 'bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-200/50 hover:border-purple-400/50 hover:shadow-purple-500/20';
      case 'gold':
        return 'bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-yellow-200/50 hover:border-yellow-400/50 hover:shadow-yellow-500/20';
      case 'orange':
        return 'bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-200/50 hover:border-orange-400/50 hover:shadow-orange-500/20';
      case 'indigo':
        return 'bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 border-indigo-200/50 hover:border-indigo-400/50 hover:shadow-indigo-500/20';
      default:
        return 'bg-gradient-to-br from-gray-500/10 to-gray-600/10 border-gray-200/50 hover:border-gray-400/50 hover:shadow-gray-500/20';
    }
  };

  return (
    <Link
      to={link}
      className={`group tablet:gap-6 flex flex-col justify-center items-center gap-4 bg-black/80 backdrop-blur-xl p-6 rounded-2xl w-full text-white transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl border ${getColorClasses(color)}`}
    >
      <div className="relative">
        <img
          src={image}
          alt={title}
          className="tablet:h-40 h-32 object-cover text-center rounded-xl group-hover:scale-110 transition-transform duration-300 filter brightness-0 invert"
        />
        {/* Overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      <h2 className="font-bold text-white text-lg tablet:text-xl text-center group-hover:text-gold transition-colors duration-300">{title}</h2>
      <p className="tablet:text-md flex-1 w-full text-white/80 text-sm text-center leading-relaxed group-hover:text-white transition-colors duration-300">
        {description}
      </p>
      <div className="w-full mt-4">
        <div className="bg-gradient-to-r from-gold to-lightGold group-hover:from-lightGold group-hover:to-gold text-black font-semibold py-2 px-4 rounded-xl text-center transition-all duration-300 transform group-hover:scale-105">
          Start Practice
        </div>
      </div>
    </Link>
  );
};

export default PracticeCard;
