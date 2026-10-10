import React from 'react';
import { ActiveTripState } from '../types/game';

interface MissionCompleteModalProps {
  tripState: ActiveTripState;
  onContinue: () => void;
}

export const MissionCompleteModal: React.FC<MissionCompleteModalProps> = ({
  tripState,
  onContinue,
}) => {
  const mission = tripState.mission;
  const baseReward = mission.rewardTaka;
  const penalties = tripState.penalties || 0;
  const safeDrivingBonus = penalties === 0 ? 150 : 50;
  const netEarnings = Math.max(100, baseReward + safeDrivingBonus - penalties);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border-2 border-emerald-500/80 rounded-3xl shadow-2xl p-6 text-center flex flex-col items-center">
        {/* Victory Icon / Badge */}
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-3xl mb-3 shadow-lg shadow-emerald-500/20">
          🎉
        </div>

        <h2 className="text-2xl font-black text-slate-100">ট্রিপ সফলভাবে সমাপ্ত!</h2>
        <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider mt-0.5">
          MISSION COMPLETED
        </p>

        <div className="text-xs text-slate-400 mt-2 px-4">
          {mission.title}
        </div>

        {/* Financial Earnings Breakdown */}
        <div className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 my-4 flex flex-col gap-2 text-xs">
          <div className="flex justify-between text-slate-300">
            <span>যাত্রী পরিবহন মূল ভাড়া:</span>
            <strong className="text-slate-100 font-speedo">৳ {baseReward}</strong>
          </div>

          <div className="flex justify-between text-emerald-400">
            <span>নিরাপদ ড্রাইভিং বোনাস:</span>
            <strong className="font-speedo">+৳ {safeDrivingBonus}</strong>
          </div>

          {penalties > 0 && (
            <div className="flex justify-between text-rose-400">
              <span>সংঘর্ষ জরিমানা:</span>
              <strong className="font-speedo">-৳ {penalties}</strong>
            </div>
          )}

          <div className="w-full h-[1px] bg-slate-800 my-1" />

          <div className="flex justify-between text-base font-black text-amber-400">
            <span>সর্বমোট উপার্জন:</span>
            <span className="font-speedo text-lg">৳ {netEarnings.toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-xs text-emerald-300 font-bold pt-1">
            <span>অর্জিত অভিজ্ঞতা:</span>
            <span>+{mission.rewardXp} XP</span>
          </div>
        </div>

        <button
          onClick={onContinue}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 text-slate-950 font-black text-sm rounded-xl shadow-lg active:scale-95 transition-all"
        >
          পুরস্কার গ্রহণ করুন ও চালিয়ে যান
        </button>
      </div>
    </div>
  );
};
