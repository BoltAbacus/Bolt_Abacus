import { FC } from 'react';
import StaticAbacus from '../../../StaticAbacus.tsx';
import ScrollAnimation from '@components/atoms/ScrollAnimation';

export interface HeroImageProps {}

const HeroImage: FC<HeroImageProps> = () => {
  return (
    <ScrollAnimation direction="up" delay={50}>
      <div className="flex justify-center items-center p-6 w-72 tablet:w-[900px] desktop:gap-12">
        <div className="h-[500px] w-[10000px] overflow-hidden">
          <StaticAbacus />
        </div>
      </div>
    </ScrollAnimation>
  );
};

export default HeroImage;
