import { FC, useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@store/authStore';
import { useNavigate } from 'react-router-dom';
import { getStudentProgressRequest } from '@services/teacher';
import type { GetStudentProgressResponse, LevelProgress } from '@interfaces/apis/teacher';
import { getUserStreak, getStreakByUserId } from '@services/streak';
import { getLevelName } from '@helpers/levelNames';

export interface LeaderboardStudent {
  rank: number;
  name: string;
  xp: number;
  avatar: string;
  level: number;
  streak: number;
  userId: number;
}

export interface StudentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: LeaderboardStudent | null;
}

const StudentDetailsModal: FC<StudentDetailsModalProps> = ({ isOpen, onClose, student }) => {
  const [expanded, setExpanded] = useState(false);
  const authToken = useAuthStore((s) => s.authToken);
  const currentUserId = useAuthStore((s) => s.user?.id);
  const navigate = useNavigate();

  // Remote progress state for the selected student
  const [progressData, setProgressData] = useState<GetStudentProgressResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [streakDays, setStreakDays] = useState<number | null>(null);

  // Compute level thresholds: level 1 = 0-90, then +100 per next level
  const computeXpToNext = (xp: number) => {
    if (xp <= 90) return Math.max(0, 90 - xp);
    // Determine current level per backend rule
    const currentLevel = ((xp - 90) >= 0) ? Math.floor((xp - 90) / 100) + 2 : 1;
    const nextLevelThreshold = currentLevel === 1 ? 90 : 90 + (currentLevel - 1) * 100;
    return Math.max(0, nextLevelThreshold - xp);
  };

  const progressPct = useMemo(() => {
    const xp = student?.xp ?? 0;
    const toNext = computeXpToNext(xp);
    const span = xp <= 90 ? 90 : 100;
    return Math.min(100, Math.round(((span - toNext) / span) * 100));
  }, [student]);

  const xpToNext = useMemo(() => computeXpToNext(student?.xp ?? 0), [student]);

  // Close on Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  // Fetch clicked student's progress when modal opens
  useEffect(() => {
    const fetchProgress = async () => {
      if (!isOpen || !student || !authToken) return;
      try {
        setLoading(true);
        const res = await getStudentProgressRequest(student.userId, authToken);
        if (res.status === 200 && res.data) {
          setProgressData(res.data as GetStudentProgressResponse);
        } else {
          setProgressData(null);
        }
      } catch (_e) {
        setProgressData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, [isOpen, student, authToken]);

  // Fetch streak: for self via token; for others via byUserId endpoint
  useEffect(() => {
    const fetchStreak = async () => {
      if (!isOpen || !student || !authToken) return;
      if (currentUserId && student.userId === currentUserId) {
        try {
          const data = await getUserStreak(authToken) as any;
          const value = typeof data?.currentStreak === 'number'
            ? data.currentStreak
            : typeof data?.data?.currentStreak === 'number'
            ? data.data.currentStreak
            : 0;
          setStreakDays(value);
        } catch {
          setStreakDays(null);
        }
      } else {
        try {
          const data = await getStreakByUserId(student.userId) as any;
          const value = typeof data?.currentStreak === 'number'
            ? data.currentStreak
            : typeof data?.data?.currentStreak === 'number'
            ? data.data.currentStreak
            : 0;
          setStreakDays(value);
        } catch {
          setStreakDays(null);
        }
      }
    };
    fetchStreak();
  }, [isOpen, student, authToken, currentUserId]);

  // Derive stats for cards from progress
  const derived = useMemo(() => {
    const empty = {
      currentLevel: 0,
      currentLevelPct: 0,
      levelsCompleted: 0,
      totalLevels: 0,
      averageScore: 0,
      classesCompleted: 0,
      totalClasses: 0,
    };
    if (!progressData) return empty;
    const levels: LevelProgress[] = progressData.levels || [];
    const totalLevels = levels.length;
    let levelsCompleted = 0;
    let classesCompleted = 0;
    let totalClasses = 0;
    const levelScores: number[] = [];
    // determine current level (highest with any activity)
    let currentLevel = 0;
    let currentLevelPct = 0;
    levels.forEach((lvl) => {
      totalClasses += lvl.classes.length;
      classesCompleted += lvl.classes.filter((c) => (c as any).Test > 0).length;
      const isCompleted = (lvl.FinalTest > 0) && (lvl.OralTest > 0);
      if (isCompleted) {
        levelsCompleted += 1;
        levelScores.push(Math.round((lvl.FinalTest + lvl.OralTest) / 2));
      }
      const hasAny = isCompleted || lvl.classes.some((c: any) => c.Test > 0 || (c.topics || []).some((t: any) => t.Classwork > 0 || t.Homework > 0));
      if (hasAny && lvl.levelId > currentLevel) {
        currentLevel = lvl.levelId;
        const completedInLevel = lvl.classes.filter((c) => (c as any).Test > 0 || (c.topics || []).some((t: any) => t.Classwork > 0 || t.Homework > 0)).length;
        currentLevelPct = Math.round((completedInLevel / 12) * 100);
      }
    });
    const averageScore = levelScores.length > 0 ? Math.round(levelScores.reduce((s, v) => s + v, 0) / levelScores.length) : 0;
    return { currentLevel, currentLevelPct, levelsCompleted, totalLevels, averageScore, classesCompleted, totalClasses };
  }, [progressData]);

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-[120]">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative z-[121] mx-auto mt-10 w-[95%] ${expanded ? 'max-w-4xl' : 'max-w-2xl'} rounded-2xl border border-gold/40 ring-1 ring-yellow-500/10 bg-gradient-to-br from-[#0c0c0c] to-[#161616] p-6 text-white shadow-2xl overflow-hidden max-h-[90vh]`}>
        {/* Decorative glows */}
        <div className="pointer-events-none absolute -inset-10 bg-[radial-gradient(circle_at_top_left,rgba(255,186,8,0.10),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(140,120,40,0.08),transparent_50%)]" />

        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute top-3 right-3 rounded-lg border border-gold/40 bg-[#141414] w-9 h-9 grid place-items-center text-lg hover:bg-[#1b1b1b]"
        >
          ×
        </button>

        <div className="relative z-10 grid grid-cols-1 tablet:grid-cols-3 gap-6 overflow-y-auto max-h-[70vh] pr-2 student-details-scroll">
          {/* Left: Avatar + rank */}
          <div className="tablet:col-span-1 flex flex-col items-center justify-center">
            <div className="relative mb-8">
              <div className="h-24 w-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold -mb-8">
                {student.avatar}
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold bg-[#1b1b1b] border border-gold/40">Rank #{student.rank}</div>
            </div>
            <div className="mt-4 text-center">
              <div className="text-lg font-bold text-gold">{getLevelName(student.level)}</div>
            </div>
          </div>

          {/* Right: Stats */}
          <div className="tablet:col-span-2 space-y-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span className="text-gold">🏅</span> {student.name}
              </h2>
              <p className="text-gray-300">XP: <span className="text-green-400 font-semibold">{student.xp.toLocaleString()}</span> • Next Rank in <span className="text-green-300 font-semibold">{xpToNext} XP</span></p>
              <div className="text-sm text-gray-300 flex items-center gap-4 mt-1">
                {progressData?.batchName && (
                  <span>Batch: <span className="text-white">{progressData.batchName}</span></span>
                )}
                {streakDays !== null && (
                  <span>Streak: <span className="text-white">{streakDays} days 🔥</span></span>
                )}
              </div>
            </div>

            {/* XP Progress */}
            <div className="bg-[#0e0e0e]/80 rounded-xl border border-gold/30 p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-white/80 font-semibold">Progress to Next Level</span>
                <span className="text-sm font-bold text-gold">{progressPct}%</span>
              </div>
              <div className="w-full bg-[#0e0e0e]/80 rounded-full h-4 shadow-inner relative overflow-hidden border border-gold/30 ring-1 ring-white/5">
                <div className="bg-gold h-4 rounded-full transition-all duration-700 shadow-[0_0_14px_rgba(255,186,8,0.30)]" style={{ width: `${progressPct}%` }} />
              </div>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-1 tablet:grid-cols-2 gap-3">
              <button
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
                onClick={() => setExpanded(true)}
              >
                View Full Progress
              </button>
              <button className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-yellow-500/25" onClick={() => navigate('/student/pvp')}>
                Challenge to PvP ⚔️
              </button>
            </div>

            {/* Highlights removed as requested */}

            {/* Expanded: Detailed Stats (real data) */}
            {expanded && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-4 gap-4">
                  <div className="bg-[#1b1b1b] p-5 rounded-lg border border-lightGold">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">⚡</div>
                      <div>
                        <p className="text-xl font-bold text-white">{loading ? '—' : `${derived.currentLevelPct}%`}</p>
                        <p className="text-xs text-gray-300">Overall Progress</p>
                        {derived.currentLevel > 0 && (
                          <p className="text-[10px] text-gray-400">for Level {derived.currentLevel}</p>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-[#0e0e0e]/80 rounded-full h-3 border border-gold/20">
                      <div className="bg-gold h-3 rounded-full" style={{ width: `${derived.currentLevelPct}%` }} />
                    </div>
                  </div>

                  <div className="bg-[#1b1b1b] p-5 rounded-lg border border-lightGold">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">🏆</div>
                      <div>
                        <p className="text-xl font-bold text-white">{loading ? '—' : `${derived.levelsCompleted}/${derived.totalLevels}`}</p>
                        <p className="text-xs text-gray-300">Levels Completed</p>
                      </div>
                    </div>
                    <div className="w-full bg-[#0e0e0e]/80 rounded-full h-3 border border-gold/20">
                      <div className="bg-green-400 h-3 rounded-full" style={{ width: `${derived.totalLevels > 0 ? Math.round((derived.levelsCompleted / derived.totalLevels) * 100) : 0}%` }} />
                    </div>
                  </div>

                  <div className="bg-[#1b1b1b] p-5 rounded-lg border border-lightGold">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">🎯</div>
                      <div>
                        <p className="text-xl font-bold text-white">{loading ? '—' : `${derived.averageScore}%`}</p>
                        <p className="text-xs text-gray-300">Average Score</p>
                      </div>
                    </div>
                    <div className="w-full bg-[#0e0e0e]/80 rounded-full h-3 border border-gold/20">
                      <div className="bg-yellow-400 h-3 rounded-full" style={{ width: `${derived.averageScore}%` }} />
                    </div>
                  </div>

                  <div className="bg-[#1b1b1b] p-5 rounded-lg border border-lightGold">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">📚</div>
                      <div>
                        <p className="text-xl font-bold text-white">{loading ? '—' : `${derived.classesCompleted}/${derived.totalClasses}`}</p>
                        <p className="text-xs text-gray-300">Classes Completed</p>
                      </div>
                    </div>
                    <div className="w-full bg-[#0e0e0e]/80 rounded-full h-3 border border-gold/20">
                      <div className="bg-purple-400 h-3 rounded-full" style={{ width: `${derived.totalClasses > 0 ? Math.round((derived.classesCompleted / derived.totalClasses) * 100) : 0}%` }} />
                    </div>
                  </div>
                </div>

                {/* Games Played removed as requested */}

                <div className="flex justify-end">
                  <button
                    className="px-4 py-2 rounded-lg border border-gold/40 hover:bg-[#1b1b1b]"
                    onClick={() => setExpanded(false)}
                  >
                    Collapse
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <style>{`
          .text-gold { color: #FFBA08; }
          .bg-gold { background-color: #FFBA08; }
          .student-details-scroll { scrollbar-width: thin; scrollbar-color: #444 transparent; }
          .student-details-scroll::-webkit-scrollbar { width: 8px; }
          .student-details-scroll::-webkit-scrollbar-thumb { background: #444; border-radius: 9999px; }
          .student-details-scroll::-webkit-scrollbar-track { background: transparent; }
        `}</style>
      </div>
    </div>
  );
};

export default StudentDetailsModal;

