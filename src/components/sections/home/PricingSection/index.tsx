import { FC } from 'react';

import PricingCard from '@components/molecules/PricingCard';
import ScrollAnimation from '@components/atoms/ScrollAnimation';

import { pricingPlans } from '@constants/pricingSectionDetails';

export interface PricingSectionProps {}

const PricingSection: FC<PricingSectionProps> = () => {
  return (
    <ScrollAnimation direction="up" delay={50}>
      <div
        id="pricing"
        className="p-12 py-5 tablet:p-10 tablet:py-6 desktop:py-8 desktop:px-24"
      >
        <ScrollAnimation direction="up" delay={100}>
          <h1 className="pt-2 text-xl font-bold text-center text-gold desktop:text-2xl">
            Pricing
          </h1>
        </ScrollAnimation>
        <div className="grid grid-cols-1 gap-12 py-10 mx-auto mt-10 tablet:py-16 tablet:grid-cols-3 desktop:grid-cols-3">
          {pricingPlans.map((plan, index) => (
            <ScrollAnimation key={index} direction="up" delay={150 + (index * 100)}>
              <PricingCard plan={plan} />
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </ScrollAnimation>
  );
};

export default PricingSection;
