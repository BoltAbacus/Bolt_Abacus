import { FC } from 'react';
import { Link } from 'react-router-dom';
import { 
  AiOutlinePlayCircle, 
  AiOutlineTrophy, 
  AiOutlineTeam,
  AiOutlineFire,
  AiOutlineSword,
  AiOutlineClockCircle
} from 'react-icons/ai';

import PracticeCard from '@components/molecules/PracticeCard';

import {
  STUDENT_FLASHCARDS,
  STUDENT_SET,
  STUDENT_TIMED,
  STUDENT_UNTIMED,
  STUDENT_PVP,
} from '@constants/routes';

export interface PracticeSectionProps {}

const PracticeSection: FC<PracticeSectionProps> = () => {
  return (
    <div className="tablet:p-10 desktop:px-24 flex flex-col justify-between gap-8 px-6 py-4 min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          🎯 Practice Arena
        </h1>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto">
          Choose your practice mode and improve your math skills! From solo practice to competitive battles, 
          we have everything you need to master abacus calculations.
        </p>
      </div>

      {/* PvP Section */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-4">
            ⚔️ PLAYER VS PLAYER ARENA ⚔️
          </h2>
          <p className="text-gray-700 text-xl font-semibold">Challenge other students in EPIC real-time battles! 🚀</p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 rounded-3xl p-8 border-2 border-purple-300/50 shadow-2xl">
          <div className="grid grid-cols-4 gap-4">
                         <div className="group relative">
               <div className="bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 backdrop-blur-xl rounded-3xl p-4 border-2 border-purple-300/50 hover:border-purple-400/80 transition-all duration-700 hover:transform hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/30">
                 <div className="text-center space-y-4">
                   <div className="relative">
                     <img 
                       src="/images/pvp-duel.svg" 
                       alt="Quick Duel" 
                       className="w-16 h-16 mx-auto rounded-2xl shadow-xl group-hover:shadow-purple-500/50 transition-all duration-700 group-hover:scale-110 group-hover:rotate-6"
                     />
                     <div className="absolute inset-0 w-16 h-16 mx-auto rounded-2xl bg-purple-400/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                   </div>
                   <h3 className="font-black text-gray-800 text-xl">Quick Duel</h3>
                   <p className="text-gray-700 text-sm font-semibold">Fast 5-question battles</p>
                   <Link
                     to={STUDENT_PVP}
                     className="inline-block w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-400 hover:via-pink-400 hover:to-orange-400 text-white font-black py-3 px-6 rounded-2xl transition-all duration-500 transform hover:scale-110 shadow-xl hover:shadow-purple-500/40"
                   >
                     🚀 START BATTLE
                   </Link>
                 </div>
               </div>
             </div>
            
                         <div className="group relative">
               <div className="bg-gradient-to-br from-yellow-500/20 via-orange-500/20 to-red-500/20 backdrop-blur-xl rounded-3xl p-4 border-2 border-yellow-300/50 hover:border-yellow-400/80 transition-all duration-700 hover:transform hover:scale-110 hover:shadow-2xl hover:shadow-yellow-500/30">
                 <div className="text-center space-y-4">
                   <div className="relative">
                     <img 
                       src="/images/pvp-tournament.svg" 
                       alt="Tournament" 
                       className="w-16 h-16 mx-auto rounded-2xl shadow-xl group-hover:shadow-yellow-500/50 transition-all duration-700 group-hover:scale-110 group-hover:rotate-6"
                     />
                     <div className="absolute inset-0 w-16 h-16 mx-auto rounded-2xl bg-yellow-400/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                   </div>
                   <h3 className="font-black text-gray-800 text-xl">Tournament</h3>
                   <p className="text-gray-700 text-sm font-semibold">Multi-player competitions</p>
                   <Link
                     to={STUDENT_PVP}
                     className="inline-block w-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-400 hover:via-orange-400 hover:to-red-400 text-white font-black py-3 px-6 rounded-2xl transition-all duration-500 transform hover:scale-110 shadow-xl hover:shadow-yellow-500/40"
                   >
                     🏆 JOIN TOURNAMENT
                   </Link>
                 </div>
               </div>
             </div>
            
                         <div className="group relative">
               <div className="bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-teal-500/20 backdrop-blur-xl rounded-3xl p-4 border-2 border-blue-300/50 hover:border-blue-400/80 transition-all duration-700 hover:transform hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/30">
                 <div className="text-center space-y-4">
                   <div className="relative">
                     <img 
                       src="/images/pvp-team.svg" 
                       alt="Team Battle" 
                       className="w-16 h-16 mx-auto rounded-2xl shadow-xl group-hover:shadow-blue-500/50 transition-all duration-700 group-hover:scale-110 group-hover:rotate-6"
                     />
                     <div className="absolute inset-0 w-16 h-16 mx-auto rounded-2xl bg-blue-400/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                   </div>
                   <h3 className="font-black text-gray-800 text-xl">Team Battle</h3>
                   <p className="text-gray-700 text-sm font-semibold">Collaborative challenges</p>
                   <Link
                     to={STUDENT_PVP}
                     className="inline-block w-full bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 hover:from-blue-400 hover:via-cyan-400 hover:to-teal-400 text-white font-black py-3 px-6 rounded-2xl transition-all duration-500 transform hover:scale-110 shadow-xl hover:shadow-blue-500/40"
                   >
                     👥 FORM TEAM
                   </Link>
                 </div>
               </div>
             </div>
            
                         <div className="group relative">
               <div className="bg-gradient-to-br from-red-500/20 via-pink-500/20 to-purple-500/20 backdrop-blur-xl rounded-3xl p-4 border-2 border-red-300/50 hover:border-red-400/80 transition-all duration-700 hover:transform hover:scale-110 hover:shadow-2xl hover:shadow-red-500/30">
                 <div className="text-center space-y-4">
                   <div className="relative">
                     <img 
                       src="/images/pvp-speed.svg" 
                       alt="Speed Challenge" 
                       className="w-16 h-16 mx-auto rounded-2xl shadow-xl group-hover:shadow-red-500/50 transition-all duration-700 group-hover:scale-110 group-hover:rotate-6"
                     />
                     <div className="absolute inset-0 w-16 h-16 mx-auto rounded-2xl bg-red-400/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                   </div>
                   <h3 className="font-black text-gray-800 text-xl">Speed Challenge</h3>
                   <p className="text-gray-700 text-sm font-semibold">Race against time</p>
                   <Link
                     to={STUDENT_PVP}
                     className="inline-block w-full bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 hover:from-red-400 hover:via-pink-400 hover:to-purple-400 text-white font-black py-3 px-6 rounded-2xl transition-all duration-500 transform hover:scale-110 shadow-xl hover:shadow-red-500/40"
                   >
                     ⚡ START RACE
                   </Link>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Solo Practice Sections */}
      <div className="space-y-12">
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              ➕ Addition and Subtraction
            </h2>
            <p className="text-gray-600">Master the fundamentals of addition and subtraction</p>
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
            <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
              ✖️ Multiplication
            </h2>
            <p className="text-gray-600">Practice multiplication tables and techniques</p>
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
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              ➗ Division
            </h2>
            <p className="text-gray-600">Master division techniques and problem solving</p>
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
  );
};

export default PracticeSection;
