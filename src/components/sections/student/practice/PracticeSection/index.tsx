import { FC } from 'react';
import { Link } from 'react-router-dom';

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
    <div className="min-h-screen bg-black">
      <div className="px-6 pt-2 tablet:p-10 desktop:px-24 space-y-6 bg-black min-h-screen">
        {/* 🔝 HEADER AREA */}
        <div className="bg-black hover:bg-[#191919] transition-colors text-white p-8 rounded-2xl border border-gold/50 ring-1 ring-white/5 backdrop-blur-xl shadow-[0_12px_36px_rgba(0,0,0,0.65)] relative overflow-hidden">
          {/* Subtle gold glow overlays */}
          <div className="pointer-events-none absolute -inset-14 bg-[radial-gradient(circle_at_top_left,rgba(255,186,8,0.08),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(250,163,7,0.06),transparent_45%)]"></div>
          {/* Glass highlight lines */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/10"></div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-black/40"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold via-lightGold to-gold"></div>
          
          <div className="relative z-10 text-center">
            <h1 className="text-5xl font-black text-gold mb-4">
              🏰 PRACTICE ARENA 🏰
            </h1>
            <div className="flex justify-center items-center gap-4 mb-6">
              <div className="bg-gold text-black px-4 py-2 rounded-full font-bold">
                ⚡ MASTER YOUR SKILLS
              </div>
              <div className="bg-purple text-white px-4 py-2 rounded-full font-bold">
                🏆 BUILD CONFIDENCE
              </div>
            </div>
            <p className="text-white text-lg max-w-3xl mx-auto">
              Choose your training method and become a math master! Practice at your own pace and build your skills step by step.
              <span className="font-bold text-gold"> Ready to learn? 🚀</span>
            </p>
          </div>
        </div>

        {/* Solo Practice Sections */}
        <div className="space-y-6">
          <div className="bg-[#080808] hover:bg-[#1b1b1b] transition-colors backdrop-blur-xl text-white p-8 rounded-2xl border border-gold/50 shadow-2xl shadow-black/50 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-blue-500/5"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-blue-500 to-purple-500"></div>
            
            <div className="relative z-10 text-center mb-8">
              <h2 className="text-4xl font-black bg-gradient-to-r from-gold via-lightGold to-orange-500 bg-clip-text text-transparent mb-4">
                🏰 SOLO TRAINING GROUNDS 🏰
              </h2>
              <p className="text-white text-xl font-semibold">Master your skills before entering the battlefield! ⚔️</p>
      </div>

        <div className="flex flex-col gap-6">
          <div className="text-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green to-lightGreen bg-clip-text text-transparent mb-2">
              ➕ Addition and Subtraction
            </h2>
                <p className="text-white">Master the fundamentals of addition and subtraction</p>
          </div>
          <div className="gap-6 grid grid-cols-1 desktop:grid-cols-4 tablet:grid-cols-2 py-4">
          <PracticeCard
            title="Flash Cards"
            image="/images/flashcards.png"
            description="Use flashcards to test your knowledge! Quickly go through each card and try to get the right answer."
            link={`${STUDENT_FLASHCARDS}`}
            color="red"
          />
          <PracticeCard
            title="No Rush Mastery"
            image="/images/unlimited-time.png"
            description="Take all the time you need to answer each question. There's no rush, just do your best!"
            link={`${STUDENT_UNTIMED}/addition`}
            color="blue"
          />
          <PracticeCard
            title="Question Countdown"
            image="/images/timed.png"
            description="The clock is ticking! Lets see how many questions you can answer before time runs out"
            link={`${STUDENT_TIMED}/addition`}
            color="green"
          />
          <PracticeCard
            title="Set Practice"
            image="/images/set.png"
            description="You can set the number of questions and the time limit. The clock is ticking! Answer them all before time runs out"
            link={`${STUDENT_SET}/addition`}
            color="pink"
          />
        </div>
      </div>
        
        <div className="flex flex-col gap-6">
          <div className="text-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-orange to-red bg-clip-text text-transparent mb-2">
              ✖️ Multiplication
            </h2>
                <p className="text-white">Practice multiplication tables and techniques</p>
          </div>
          <div className="gap-6 grid grid-cols-1 desktop:grid-cols-3 tablet:grid-cols-3 py-4">
          <PracticeCard
            title="No Rush Mastery"
            image="/images/unlimited-time.png"
            description="Take all the time you need to answer each question. There's no rush, just do your best!"
            link={`${STUDENT_UNTIMED}/multiplication`}
            color="blue"
          />
          <PracticeCard
            title="Question Countdown"
            image="/images/timed.png"
            description="The clock is ticking! Lets see how many questions you can answer before time runs out"
            link={`${STUDENT_TIMED}/multiplication`}
            color="green"
          />
          <PracticeCard
            title="Set Practice"
            image="/images/set.png"
            description="You can set the number of questions and the time limit. The clock is ticking! Answer them all before time runs out"
            link={`${STUDENT_SET}/multiplication`}
            color="pink"
          />
        </div>
      </div>
        
        <div className="flex flex-col gap-6">
          <div className="text-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple to-pink-500 bg-clip-text text-transparent mb-2">
              ➗ Division
            </h2>
                <p className="text-white">Master division techniques and problem solving</p>
          </div>
          <div className="gap-6 grid grid-cols-1 desktop:grid-cols-3 tablet:grid-cols-3 py-4">
          <PracticeCard
            title="No Rush Mastery"
            image="/images/unlimited-time.png"
            description="Take all the time you need to answer each question. There's no rush, just do your best!"
            link={`${STUDENT_UNTIMED}/division`}
            color="blue"
          />
          <PracticeCard
            title="Question Countdown"
            image="/images/timed.png"
            description="The clock is ticking! Lets see how many questions you can answer before time runs out"
            link={`${STUDENT_TIMED}/division`}
            color="green"
          />
          <PracticeCard
            title="Set Practice"
            image="/images/set.png"
            description="You can set the number of questions and the time limit. The clock is ticking! Answer them all before time runs out"
            link={`${STUDENT_SET}/division`}
            color="pink"
          />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeSection;
