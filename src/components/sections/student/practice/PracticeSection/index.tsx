import { FC } from 'react';

import PracticeCard from '@components/molecules/PracticeCard';

import {
  STUDENT_FLASHCARDS,
  STUDENT_SET,
  STUDENT_TIMED,
  STUDENT_UNTIMED,
} from '@constants/routes';

export interface PracticeSectionProps {}

const PracticeSection: FC<PracticeSectionProps> = () => {

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#000000' }}>
      <div className="px-4 pt-2 tablet:p-6 desktop:px-12 space-y-4 min-h-screen" style={{ backgroundColor: '#000000' }}>

        {/* Arcade Game Catalog */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-4xl font-black bg-gradient-to-r from-gold via-lightGold to-orange-500 bg-clip-text text-transparent mb-2">
              🏰 Training Ground ⚔️
            </h2>
            <p className="text-lg" style={{ color: '#818181' }}>🎮 Choose your game and start playing! 🚀</p>
          </div>

          {/* Addition & Subtraction Games */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: '#ffffff' }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#ffffff' }}></span>
              ➕ Addition & Subtraction ➖
            </h3>
            <div className="gap-3 grid grid-cols-1 desktop:grid-cols-2 tablet:grid-cols-2">
          <PracticeCard
            title="Flash Cards"
            image="/images/flashcards.png"
            description="Quick memory training with instant feedback!"
            link={`${STUDENT_FLASHCARDS}`}
            color="red"
          />
          <PracticeCard
            title="No Rush Mastery"
            image="/images/unlimited-time.png"
            description="Learn at your own pace without pressure."
            link={`${STUDENT_UNTIMED}/addition`}
            color="blue"
          />
          <PracticeCard
            title="Time Attack"
            image="/images/timed.png"
            description="Race against the clock in this fast-paced challenge!"
            link={`${STUDENT_TIMED}/addition`}
            color="green"
          />
          <PracticeCard
            title="Custom Challenge"
            image="/images/set.png"
            description="Create your own rules and difficulty settings."
            link={`${STUDENT_SET}/addition`}
            color="pink"
          />
            </div>
          </div>
        
          {/* Multiplication Games */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: '#ffffff' }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#ffffff' }}></span>
              ✖️ Multiplication
            </h3>
            <div className="gap-3 grid grid-cols-1 desktop:grid-cols-3 tablet:grid-cols-3">
            <PracticeCard
              title="No Rush Mastery"
              image="/images/unlimited-time.png"
              description="Master multiplication tables at your own speed."
              link={`${STUDENT_UNTIMED}/multiplication`}
              color="blue"
            />
            <PracticeCard
              title="Time Attack"
              image="/images/timed.png"
              description="Speed through multiplication problems under pressure!"
              link={`${STUDENT_TIMED}/multiplication`}
              color="green"
            />
            <PracticeCard
              title="Custom Challenge"
              image="/images/set.png"
              description="Design your own multiplication workout."
              link={`${STUDENT_SET}/multiplication`}
              color="pink"
            />
            </div>
          </div>
        
          {/* Division Games */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: '#ffffff' }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#ffffff' }}></span>
              ➗ Division
            </h3>
            <div className="gap-3 grid grid-cols-1 desktop:grid-cols-3 tablet:grid-cols-3">
            <PracticeCard
              title="No Rush Mastery"
              image="/images/unlimited-time.png"
              description="Conquer division problems without time pressure."
              link={`${STUDENT_UNTIMED}/division`}
              color="blue"
            />
            <PracticeCard
              title="Time Attack"
              image="/images/timed.png"
              description="Divide and conquer against the ticking clock!"
              link={`${STUDENT_TIMED}/division`}
              color="green"
            />
            <PracticeCard
              title="Custom Challenge"
              image="/images/set.png"
              description="Build your ultimate division training session."
              link={`${STUDENT_SET}/division`}
              color="pink"
            />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeSection;
