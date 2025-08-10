import { FC, useEffect, useMemo, useRef, useState } from 'react';

export interface AchievementItem {
  id: number;
  name: string;
  icon: string; // emoji or short label
  unlocked: boolean;
  description: string;
}

export interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: AchievementItem[];
  pinnedIds?: number[];
  onTogglePin?: (id: number) => void; // maintains at most 6 elsewhere
}

const AchievementsModal: FC<AchievementsModalProps> = ({ isOpen, onClose, achievements, pinnedIds = [], onTogglePin }) => {
  const [selected, setSelected] = useState<AchievementItem | null>(null);
  const [showBalloons, setShowBalloons] = useState(false);

  useEffect(() => {
    if (!isOpen) setSelected(null);
  }, [isOpen]);

  // Trigger balloons every time a detail opens
  useEffect(() => {
    if (!selected) return;
    // reset to restart animation
    setShowBalloons(false);
    const t0 = setTimeout(() => setShowBalloons(true), 0);
    const t1 = setTimeout(() => setShowBalloons(false), 3500);
    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
    };
  }, [selected]);

  // Close on Escape: if detail is open, close it; else close the modal
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selected) {
          setSelected(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, selected, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-[101] mx-auto mt-10 w-[95%] max-w-5xl rounded-2xl border border-gold/40 bg-[#0b0b0b] p-6 text-white shadow-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold flex items-center"><span className="mr-2">🏆</span> All Achievements</h2>
            <p className="text-sm text-gray-400">Unlocked and locked achievements</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Download Zoom background - using logo as placeholder */}
            <a href="/logo.png" download className="inline-flex items-center gap-2 rounded-lg border border-gold/50 bg-[#141414] px-3 py-2 text-sm hover:bg-[#1b1b1b]">
              <span>Download Zoom Background</span>
              <span>📥</span>
            </a>
            <button aria-label="Close" onClick={onClose} className="rounded-lg border border-gold/40 bg-[#141414] w-9 h-9 grid place-items-center text-lg hover:bg-[#1b1b1b]">×</button>
          </div>
        </div>

        {/* Scrollable Grid */}
        <div className="overflow-y-auto achievements-scroll max-h-[70vh] pr-2">
          <div className="grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4 gap-4">
            {achievements.map((a) => {
              const isPinned = pinnedIds.includes(a.id);
              return (
                <div
                  key={a.id}
                  className={`group relative p-4 rounded-xl border ring-1 ring-white/5 transition ${
                    a.unlocked
                      ? 'bg-[#0e0e0e]/80 hover:bg-[#1b1b1b] border-gold/60 hover:border-gold'
                      : 'bg-[#0e0e0e] hover:bg-[#1b1b1b] border-gold/30 opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelected(a)}>
                    <div className={`text-2xl ${a.unlocked ? '' : 'grayscale'}`}>{a.icon}</div>
                    <div>
                      <div className={`text-sm font-bold ${a.unlocked ? 'text-white' : 'text-gray-400'}`}>{a.name}</div>
                      <div className={`text-xs ${a.unlocked ? 'text-gray-300' : 'text-gray-500'}`}>{a.description}</div>
                    </div>
                  </div>
                  {onTogglePin && (
                    <button
                      onClick={() => onTogglePin(a.id)}
                      className={`absolute top-2 right-2 w-7 h-7 rounded-full border text-xs grid place-items-center transition ${
                        isPinned ? 'border-gold bg-gold/10 text-gold' : 'border-white/20 bg-black/30 text-white/70 hover:bg-black/50'
                      }`}
                      title={isPinned ? 'Unpin' : 'Pin'}
                    >
                      {isPinned ? '★' : '☆'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detail Overlay */}
      {selected && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSelected(null)} />
          <div className="relative z-[111] w-80 tablet:w-96 aspect-square rounded-2xl border border-gold/40 ring-1 ring-yellow-500/10 bg-gradient-to-br from-[#0c0c0c] to-[#161616] p-6 text-white shadow-2xl overflow-hidden">
            {/* Subtle decorative glows */}
            <div className="pointer-events-none absolute -inset-10 bg-[radial-gradient(circle_at_top_left,rgba(255,186,8,0.10),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(140,120,40,0.08),transparent_50%)]"></div>
            {/* Apple-like balloons (first time only) */}
            {showBalloons && (
              <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
                {[
                  { x: '6%', d: '0s', s: '1' },
                  { x: '14%', d: '.2s', s: '.95' },
                  { x: '22%', d: '.35s', s: '1.05' },
                  { x: '30%', d: '.1s', s: '1' },
                  { x: '38%', d: '.25s', s: '.9' },
                  { x: '46%', d: '.5s', s: '1.1' },
                  { x: '54%', d: '.15s', s: '1' },
                  { x: '62%', d: '.6s', s: '.95' },
                  { x: '70%', d: '.7s', s: '1.05' },
                  { x: '78%', d: '.8s', s: '1' },
                  { x: '86%', d: '.9s', s: '.9' },
                  { x: '94%', d: '1s', s: '1.1' },
                  { x: '10%', d: '1.1s', s: '.98' },
                  { x: '26%', d: '1.2s', s: '1.03' },
                  { x: '42%', d: '1.3s', s: '1.06' },
                  { x: '58%', d: '1.4s', s: '.94' },
                  { x: '74%', d: '1.5s', s: '1.08' },
                  { x: '90%', d: '1.6s', s: '1.0' },
                ].map((b, i) => (
                  <span
                    key={i}
                    className="balloon"
                    style={{ left: b.x as string, animationDelay: b.d as string, transform: `scale(${b.s})` }}
                  >
                    🎈
                  </span>
                ))}
              </div>
            )}

            {/* Close button */}
            <button
              aria-label="Close details"
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3 rounded-lg border border-gold/40 bg-[#141414] w-9 h-9 grid place-items-center text-lg hover:bg-[#1b1b1b]"
            >
              ×
            </button>

            {/* Centered content */}
            <div className="relative z-10 h-full w-full flex flex-col items-center justify-center text-center px-2">
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-gold to-yellow-500 mb-3 shadow-[0_0_22px_rgba(255,186,8,0.35)]">
                <span className="text-3xl">{selected.icon}</span>
              </span>
              <h3 className="text-xl font-bold mb-1">{selected.name}</h3>
              <p className="text-gray-300 mb-3 line-clamp-4 max-w-[85%]">{selected.description}</p>
              <div className={`inline-block rounded-full px-3 py-1 text-xs border ${selected.unlocked ? 'border-green-400 text-green-300' : 'border-gray-500 text-gray-400'}`}>
                {selected.unlocked ? 'Unlocked' : 'Locked'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Local animation utility */}
      <style>{`
        /* Removed spin usage for cleaner look */
        .achievements-scroll { scrollbar-width: thin; scrollbar-color: #444 transparent; }
        .achievements-scroll::-webkit-scrollbar { width: 8px; }
        .achievements-scroll::-webkit-scrollbar-thumb { background: #444; border-radius: 9999px; }
        .achievements-scroll::-webkit-scrollbar-track { background: transparent; }
        .balloon {
          position: absolute;
          bottom: -15%;
          font-size: 28px;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,.35));
          animation: balloonFloat 3.2s ease-out forwards, balloonSway 2.4s ease-in-out infinite;
        }
        @keyframes balloonFloat {
          0% { transform: translateY(100%) scale(.9); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(-120%) scale(1.05); opacity: 0; }
        }
        @keyframes balloonSway {
          0% { margin-left: 0; }
          50% { margin-left: 6px; }
          100% { margin-left: 0; }
        }
      `}</style>
    </div>
  );
};

export default AchievementsModal;

