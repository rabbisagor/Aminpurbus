import React from 'react';

interface PauseMenuProps {
  onResume: () => void;
  onRestartTrip: () => void;
  onOpenSettings: () => void;
  onExitToMenu: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onRestartTrip,
  onOpenSettings,
  onExitToMenu,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 text-center flex flex-col gap-3">
        <h2 className="text-2xl font-black text-amber-400">খেলা স্থগিত (PAUSED)</h2>
        <p className="text-xs text-slate-400 -mt-1 mb-2">আমিনপুর বাস সিমুলেটর</p>

        <button
          onClick={onResume}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-sm rounded-xl shadow-lg active:scale-95 transition-all"
        >
          চালিয়ে যান (Resume)
        </button>

        <button
          onClick={onRestartTrip}
          className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl active:scale-95 transition-all"
        >
          ট্রিপ পুনরায় শুরু করুন (Restart)
        </button>

        <button
          onClick={onOpenSettings}
          className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl active:scale-95 transition-all"
        >
          ⚙️ সেটিংস (Settings)
        </button>

        <button
          onClick={onExitToMenu}
          className="w-full py-3 bg-rose-950/80 hover:bg-rose-900 border border-rose-800/60 text-rose-300 font-bold text-xs rounded-xl active:scale-95 transition-all mt-2"
        >
          মূল মেনুতে ফিরুন (Exit to Menu)
        </button>
      </div>
    </div>
  );
};
