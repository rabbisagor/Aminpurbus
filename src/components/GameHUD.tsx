import React from 'react';
import { ActiveTripState, GearMode, CameraMode } from '../types/game';
import { Minimap } from './Minimap';

interface GameHUDProps {
  speedKmh: number;
  engineRpm: number;
  gear: GearMode;
  fuelLiters: number;
  maxFuel: number;
  damagePercent: number;
  activeTrip: ActiveTripState | null;
  playerPos: { x: number; z: number; rotationY: number };
  onPause: () => void;
  onCameraCycle: () => void;
  cameraMode: CameraMode;
  money: number;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  speedKmh,
  engineRpm,
  gear,
  fuelLiters,
  maxFuel,
  damagePercent,
  activeTrip,
  playerPos,
  onPause,
  onCameraCycle,
  cameraMode,
  money,
}) => {
  const fuelPercent = Math.round((fuelLiters / (maxFuel || 1)) * 100);

  // Remaining distance to destination stop
  let distanceToGoal = 0;
  if (activeTrip && activeTrip.targetStop) {
    distanceToGoal = Math.round(
      Math.hypot(playerPos.x - activeTrip.targetStop.x, playerPos.z - activeTrip.targetStop.z)
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-3 md:p-5">
      {/* Top Header Bar */}
      <div className="flex items-start justify-between w-full">
        {/* Top Left: Speedometer & Gauge Cluster */}
        <div className="flex items-center gap-3 bg-slate-950/85 border border-slate-800/80 rounded-2xl p-2.5 shadow-2xl backdrop-blur-md pointer-events-auto">
          {/* Digital Speedometer */}
          <div className="flex flex-col items-center justify-center min-w-[76px]">
            <div className="text-4xl md:text-5xl font-speedo font-black text-amber-400 tracking-tight leading-none">
              {Math.abs(speedKmh)}
            </div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              কিমি/ঘণ্টা (KM/H)
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="w-[1px] h-10 bg-slate-800" />

          {/* Vehicle Vitals (Gear, Fuel, Damage) */}
          <div className="flex flex-col gap-1 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">গিয়ার:</span>
              <span
                className={`px-1.5 py-0.5 rounded font-black text-[11px] ${
                  gear === 'D'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/60'
                    : gear === 'R'
                    ? 'bg-red-950 text-red-400 border border-red-700/60'
                    : 'bg-amber-950 text-amber-400 border border-amber-700/60'
                }`}
              >
                {gear}
              </span>
            </div>

            {/* Fuel Bar */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400">জ্বালানি:</span>
              <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    fuelPercent > 25 ? 'bg-amber-400' : 'bg-red-500 animate-pulse'
                  }`}
                  style={{ width: `${fuelPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-300">{fuelPercent}%</span>
            </div>

            {/* Vehicle Damage */}
            {damagePercent > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400">ক্ষতি:</span>
                <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 transition-all duration-300"
                    style={{ width: `${damagePercent}%` }}
                  />
                </div>
                <span className="text-[10px] text-rose-400">{damagePercent}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Center: Mission / Passenger Route Card (if active) */}
        {activeTrip ? (
          <div className="hidden sm:flex flex-col items-center bg-slate-950/85 border border-emerald-600/40 rounded-2xl px-4 py-2 shadow-2xl backdrop-blur-md max-w-sm">
            <div className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <span>🚏 {activeTrip.passengersOnBoard === 0 ? 'যাত্রী তুলুন (Pickup)' : 'যাত্রী নামান (Dropoff)'}</span>
            </div>
            <div className="text-sm font-bold text-slate-100 truncate w-full text-center">
              {activeTrip.targetStop?.name || 'গন্তব্য'}
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300 mt-0.5">
              <span>দূরত্ব: <strong className="text-amber-400">{distanceToGoal} মি.</strong></span>
              <span>•</span>
              <span>যাত্রী: <strong className="text-emerald-400">{activeTrip.passengersOnBoard} জন</strong></span>
            </div>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-2 bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <span>মুক্ত ড্রাইভ মোড (Free Drive)</span>
          </div>
        )}

        {/* Top Right: Wallet, Pause Button, and Minimap */}
        <div className="flex items-start gap-2.5 pointer-events-auto">
          {/* Earnings Badge */}
          <div className="hidden xs:flex items-center gap-1.5 bg-slate-950/85 border border-emerald-500/40 px-3 py-1.5 rounded-xl shadow-lg">
            <span className="text-emerald-400 font-bold text-sm">৳ {money.toLocaleString()}</span>
          </div>

          {/* Pause Button */}
          <button
            onClick={onPause}
            className="w-10 h-10 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl flex items-center justify-center text-slate-200 shadow-xl active:scale-95 transition-all"
            title="বিরতি (Pause)"
          >
            ⏸
          </button>

          {/* Minimap Widget */}
          <Minimap
            playerX={playerPos.x}
            playerZ={playerPos.z}
            playerRotationY={playerPos.rotationY}
            targetStop={activeTrip?.targetStop}
          />
        </div>
      </div>

      {/* Desktop Keyboard Helper Bar (shown subtly on large screens) */}
      <div className="hidden md:flex justify-center w-full mb-1">
        <div className="bg-slate-950/75 border border-slate-800/80 rounded-full px-4 py-1 text-[11px] text-slate-400 flex items-center gap-3 backdrop-blur-sm">
          <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-200">W</kbd> বা <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-200">↑</kbd> গতি</span>
          <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-200">S</kbd> বা <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-200">↓</kbd> ব্রেক/রিভার্স</span>
          <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-200">A/D</kbd> স্টিয়ারিং</span>
          <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-200">হর্ন: H</kbd></span>
          <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-200">ক্যামেরা: C</kbd></span>
          <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-200">যাত্রী: E</kbd></span>
        </div>
      </div>
    </div>
  );
};
