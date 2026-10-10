import React from 'react';
import { PlayerProfile } from '../types/game';

interface MainMenuProps {
  onStartCareer: () => void;
  onFreeDrive: () => void;
  onOpenGarage: () => void;
  onOpenRoutes: () => void;
  onOpenSettings: () => void;
  onOpenHowToPlay: () => void;
  onOpenMapInspector: () => void;
  profile: PlayerProfile;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartCareer,
  onFreeDrive,
  onOpenGarage,
  onOpenRoutes,
  onOpenSettings,
  onOpenHowToPlay,
  onOpenMapInspector,
  profile,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between p-4 md:p-8 bg-gradient-to-b from-slate-950/80 via-slate-900/60 to-slate-950/95 backdrop-blur-sm select-none overflow-y-auto">
      {/* Top Bar: Player Stats / Profile Badges */}
      <div className="flex items-center justify-between w-full max-w-5xl mx-auto">
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/60 rounded-2xl px-4 py-2 shadow-xl">
          <div className="w-9 h-9 rounded-xl bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-lg">
            🚌
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-300">{profile.name}</div>
            <div className="text-[11px] font-bold text-emerald-400">লেভেল {profile.level} (XP: {profile.xp})</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-amber-500/40 px-4 py-2 rounded-2xl shadow-xl">
            <span className="text-xs text-amber-300 font-bold">টাকা:</span>
            <span className="text-base font-black text-amber-400 font-speedo">
              ৳ {profile.money.toLocaleString()}
            </span>
          </div>

          <button
            onClick={onOpenSettings}
            className="w-10 h-10 rounded-2xl bg-slate-900/90 border border-slate-700 hover:bg-slate-800 flex items-center justify-center text-slate-200 transition-all active:scale-95 shadow-xl"
            title="সেটিংস"
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* Center Branding & Title */}
      <div className="flex flex-col items-center text-center my-auto py-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
          <span>🇧🇩 আমিনপুর, পাবনা জেলা, বাংলাদেশ</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-emerald-400 drop-shadow-md tracking-tight leading-tight">
          আমিনপুর বাস সিমুলেটর
        </h1>
        <h2 className="text-sm md:text-lg font-bold text-slate-300 tracking-wider uppercase mt-1">
          AMINPUR BUS SIMULATOR
        </h2>
        <p className="max-w-md text-xs md:text-sm text-slate-400 mt-2 px-4">
          পাবনা-আমিনপুরের চিরচেনা গ্রামীন সড়ক, হাটবাজার ও পদ্মা-যমুনার নদীপথে বাস চালিয়ে যাত্রী পরিবহনের বাস্তব অভিজ্ঞতা!
        </p>
      </div>

      {/* Main Action Menu Buttons */}
      <div className="w-full max-w-md mx-auto flex flex-col gap-2.5 pb-4">
        {/* Play Career / Route Selector */}
        <button
          onClick={onOpenRoutes}
          className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-black text-lg rounded-2xl shadow-xl shadow-emerald-900/40 border border-emerald-300 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
        >
          <span>🚦</span>
          <span>ড্রাইভ শুরু করুন (Select Route)</span>
        </button>

        {/* Free Drive */}
        <button
          onClick={onFreeDrive}
          className="w-full py-3 bg-slate-900/90 hover:bg-slate-800 text-slate-100 font-bold text-sm rounded-2xl border border-slate-700/80 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <span>🛣️</span>
          <span>মুক্ত ড্রাইভ (Free Roam)</span>
        </button>

        {/* Garage & Bus Customization */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={onOpenGarage}
            className="py-3 bg-slate-900/90 hover:bg-slate-800 text-slate-100 font-bold text-xs md:text-sm rounded-2xl border border-slate-700/80 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
          >
            <span>🔧</span>
            <span>গ্যারেজ ও বাস (Garage)</span>
          </button>

          <button
            onClick={onOpenMapInspector}
            className="py-3 bg-slate-900/90 hover:bg-slate-800 text-slate-100 font-bold text-xs md:text-sm rounded-2xl border border-slate-700/80 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
          >
            <span>🗺️</span>
            <span>আমিনপুর ম্যাপ (Map)</span>
          </button>
        </div>

        {/* How to Play */}
        <button
          onClick={onOpenHowToPlay}
          className="w-full py-2.5 bg-slate-950/80 hover:bg-slate-900 text-slate-400 hover:text-slate-200 text-xs font-semibold rounded-xl border border-slate-800 active:scale-[0.98] transition-all"
        >
          🕹️ কন্ট্রোল ও খেলার নিয়ম (Controls & Guide)
        </button>
      </div>

      {/* Footer Info */}
      <div className="text-center text-[10px] text-slate-500 pt-2 border-t border-slate-800/60">
        আমিনপুর বাস সিমুলেটর • ৩ডি ওয়েব ড্রাইভিং গেম • ভার্সন ১.০ • GitHub ও Vercel প্রস্তুত
      </div>
    </div>
  );
};
