import React from 'react';
import { ROUTE_MISSIONS } from '../data/routeData';
import { RouteMission, BusStop } from '../types/game';
import { BUS_STOPS } from '../data/mapData';

interface RouteSelectModalProps {
  onSelectRoute: (mission: RouteMission) => void;
  onClose: () => void;
}

export const RouteSelectModal: React.FC<RouteSelectModalProps> = ({
  onSelectRoute,
  onClose,
}) => {
  const getStopName = (stopId: string) => {
    const s = BUS_STOPS.find((b) => b.id === stopId);
    return s?.name || stopId;
  };

  return (
    <div className="fixed inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 select-none animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-amber-400">
              রুট ও মিশন নির্বাচন (Select Route)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              আমিনপুর ও পার্শ্ববর্তী এলাকার যাত্রীবাহী বাস রুট বেছে নিন
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Route Cards List */}
        <div className="p-4 md:p-5 overflow-y-auto flex flex-col gap-3.5 space-y-0.5">
          {ROUTE_MISSIONS.map((route, index) => {
            const startName = getStopName(route.fromStopId);
            const endName = getStopName(route.toStopId);

            return (
              <div
                key={route.id}
                className="bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-emerald-950/90 text-emerald-400 border border-emerald-700/50 rounded-md text-[11px] font-bold">
                      রুট #{index + 1}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md text-[11px] font-semibold">
                      {route.difficulty}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-100">{route.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{route.description}</p>

                  {/* Route Corridor Details */}
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-300">
                    <span className="flex items-center gap-1">
                      <span className="text-emerald-400 font-bold">যাত্রা:</span> {startName}
                    </span>
                    <span>➔</span>
                    <span className="flex items-center gap-1">
                      <span className="text-rose-400 font-bold">গন্তব্য:</span> {endName}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                    <span>দূরত্ব: <strong className="text-slate-200">{route.distanceKm} কিমি</strong></span>
                    <span>আনুমানিক সময়: <strong className="text-slate-200">{route.estimatedTimeMin} মিনিট</strong></span>
                  </div>
                </div>

                {/* Reward and Start Button */}
                <div className="flex md:flex-col items-center justify-between md:items-end gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80">
                  <div className="text-right">
                    <div className="text-base md:text-lg font-black text-amber-400 font-speedo">
                      ৳ {route.rewardTaka}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-bold">
                      +{route.rewardXp} XP পয়েন্ট
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectRoute(route)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-slate-950 font-black text-xs md:text-sm rounded-xl shadow-lg shadow-emerald-950/60 transition-all active:scale-95 flex items-center gap-1.5"
                  >
                    <span>বাস ছাড়ুন</span>
                    <span>➔</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all"
          >
            ফিরে যান (Back)
          </button>
        </div>
      </div>
    </div>
  );
};
