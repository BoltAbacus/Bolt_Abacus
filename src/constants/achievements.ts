export interface AchievementItemConst {
  id: number;
  name: string;
  icon: string;
  unlocked: boolean;
  description: string;
}

export const ACHIEVEMENTS: AchievementItemConst[] = [
  { id: 1, name: 'First Steps', icon: '👣', unlocked: true, description: 'Complete your first lesson' },
  { id: 2, name: 'Speed Demon', icon: '⚡', unlocked: true, description: 'Complete 5 sessions in a day' },
  { id: 3, name: 'Champion', icon: '🏆', unlocked: false, description: 'Reach Eternal Realm' },
  { id: 4, name: 'Streak Master', icon: '🔥', unlocked: true, description: 'Maintain 7-day streak' },
  { id: 5, name: 'Math Wizard', icon: '🧙‍♂️', unlocked: false, description: 'Achieve 95% accuracy' },
  { id: 6, name: 'Time Traveler', icon: '⏰', unlocked: false, description: 'Spend 10 hours learning' },
  { id: 7, name: 'Early Bird', icon: '🌅', unlocked: true, description: 'Study before 7 AM for 3 days' },
  { id: 8, name: 'Night Owl', icon: '🌙', unlocked: false, description: 'Study after 10 PM for 5 days' },
  { id: 9, name: 'Consistency King', icon: '📅', unlocked: true, description: 'Study 10 days in a row' },
  { id: 10, name: 'Problem Solver', icon: '🧩', unlocked: true, description: 'Solve 500 problems total' },
  { id: 11, name: 'Accuracy Ace', icon: '🎯', unlocked: false, description: 'Maintain 90%+ accuracy for a week' },
  { id: 12, name: 'Mentor', icon: '🧑‍🏫', unlocked: false, description: 'Help a friend complete a level' },
  { id: 13, name: 'Marathoner', icon: '🏃‍♂️', unlocked: false, description: 'Study 2 hours in one session' },
  { id: 14, name: 'Sprinter', icon: '💨', unlocked: true, description: 'Finish a session in under 10 minutes' },
  { id: 15, name: 'Collector', icon: '🪙', unlocked: true, description: 'Earn 1,000 XP total' },
  { id: 16, name: 'Strategist', icon: '♟️', unlocked: false, description: 'Plan and complete weekly goals' },
  { id: 17, name: 'Comeback', icon: '🔁', unlocked: false, description: 'Return after a 7-day break' },
  { id: 18, name: 'All-Rounder', icon: '🌀', unlocked: false, description: 'Score points across 5 categories in a week' },
  { id: 19, name: 'Zen Master', icon: '🧘‍♂️', unlocked: true, description: 'Study with no distractions for 30 minutes' },
  { id: 20, name: 'Explorer', icon: '🧭', unlocked: true, description: 'Visit all major app sections' },
  { id: 21, name: 'Bead Beginner', icon: '🧮', unlocked: true, description: 'Complete your first abacus session' },
  { id: 22, name: 'Soroban Starter', icon: '📏', unlocked: true, description: 'Learn the basic soroban layout' },
  { id: 23, name: 'Upper Deck Pro', icon: '⬆️', unlocked: false, description: 'Master upper bead adjustments across 5 sessions' },
  { id: 24, name: 'Lower Deck Pro', icon: '⬇️', unlocked: false, description: 'Master lower bead adjustments across 5 sessions' },
  { id: 25, name: 'Carryover Champ', icon: '🔁', unlocked: true, description: 'Perform 50 correct carryovers in addition' },
  { id: 26, name: 'Borrowing Boss', icon: '↩️', unlocked: false, description: 'Perform 50 correct borrowings in subtraction' },
  { id: 27, name: 'Decimal Dynamo', icon: '🔟', unlocked: false, description: 'Solve 30 decimal abacus problems' },
  { id: 28, name: 'Column Crusher', icon: '🏛️', unlocked: true, description: 'Finish a 5-column problem without errors' },
  { id: 29, name: 'Rapid Beads', icon: '⚡', unlocked: true, description: 'Solve 20 abacus problems in under 2 minutes' },
  { id: 30, name: 'Visualization Virtuoso', icon: '🧠', unlocked: false, description: 'Complete 3 mental abacus drills perfectly' },
  { id: 31, name: 'Multi-Digit Maverick', icon: '🔢', unlocked: true, description: 'Accurately add 6-digit numbers on abacus' },
  { id: 32, name: 'Soroban Sprint', icon: '🏁', unlocked: false, description: 'Finish a timed abacus test with 90% accuracy' },
  { id: 33, name: 'Pattern Prodigy', icon: '🧩', unlocked: false, description: 'Recognize 10 bead patterns instantly' },
  { id: 34, name: 'Finger Technique Pro', icon: '☝️', unlocked: true, description: 'Keep correct finger technique for one full session' },
  { id: 35, name: 'Long Multiplication Soroban', icon: '✖️', unlocked: false, description: 'Complete long multiplication using soroban' },
  { id: 36, name: 'Soroban Division Master', icon: '➗', unlocked: false, description: 'Complete long division using soroban' },
  { id: 37, name: 'Balanced Beads', icon: '⚖️', unlocked: true, description: 'Maintain perfect bead resets for 3 exercises' },
  { id: 38, name: 'Left-to-Right Legend', icon: '⬅️', unlocked: false, description: 'Execute 25 left-to-right operations without error' },
  { id: 39, name: 'Right-to-Left Ruler', icon: '➡️', unlocked: true, description: 'Execute 25 right-to-left operations without error' },
  { id: 40, name: 'Abacus Architect', icon: '🏗️', unlocked: false, description: 'Combine addition, subtraction, and carryover in one complex problem' },
];

