import React from 'react';
import { GearMode, CameraMode } from '../types/game';

interface MobileControlsProps {
  onAccelerateChange: (active: boolean) => void;
  onBrakeChange: (active: boolean) => void;
  onSteerLeftChange: (active: boolean) => void;
  onSteerRightChange: (active: boolean) => void;
  onHandbrakeToggle: () => void;
  onHornChange: (active: boolean) => void;
  onHeadlightsToggle: () => void;
  onGearChange: (gear: GearMode) => void;
  onCameraCycle: () => void;
  onPassengerAction: () => void;
  currentGear: GearMode;
  currentCamera: CameraMode;
  isHeadlightsOn: boolean;
  canBoardPassengers: boolean;
  isHandbrakeOn: boolean;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onAccelerateChange,
  onBrakeChange,
  onSteerLeftChange,
  onSteerRightChange,
  onHandbrakeToggle,
  onHornChange,
  onHeadlightsToggle,
  onGearChange,
  onCameraCycle,
  onPassengerAction,
  currentGear,
  currentCamera,
  isHeadlightsOn,
  canBoardPassengers,
  isHandbrakeOn,
}) => {
  // Utility for bindable touch/pointer events to prevent gesture sticking
  const bindHoldEvents = (callback: (active: boolean) => void) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      callback(true);
    },
    onPointerUp: (e: React.PointerEvent) => {
      e.preventDefault();
      callback(false);
    },
    onPointerLeave: (e: React.PointerEvent) => {
      e.preventDefault();
      callback(false);
    },
    onPointerCancel: (e: React.PointerEvent) => {
      e.preventDefault();
      callback(false);
    },
    onTouchStart: (e: React.TouchEvent) => {
      e.preventDefault();
      callback(true);
    },
    onTouchEnd: (e: React.TouchEvent) => {
      e.preventDefault();
      callback(false);
    },
  });

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-20 flex flex-col justify-between p-3 md:p-5">
      {/* Top Utility Controls (Camera, Headlights, Horn) */}
      <div className="flex items-center justify-between pointer-events-auto">
        <div className="flex gap-2">
          {/* Camera Switch */}
          <button
            onClick={onCameraCycle}
            className="px-3.5 py-2 bg-slate-900/80 hover:bg-slate-800 text-slate-100 border border-slate-700/60 rounded-xl shadow-lg backdrop-blur-md active:scale-95 transition-all flex items-center gap-1.5 text-xs font-semibold"
          >
            <span>📹 {currentCamera}</span>
          </button>

          {/* Headlights Toggle */}
          <button
            onClick={onHeadlightsToggle}
            className={`px-3 py-2 border rounded-xl shadow-lg backdrop-blur-md active:scale-95 transition-all text-xs font-semibold ${
              isHeadlightsOn
                ? 'bg-amber-500/80 text-amber-950 border-amber-300'
                : 'bg-slate-900/80 text-slate-300 border-slate-700/60'
            }`}
          >
            💡 {isHeadlightsOn ? 'লাইট অন' : 'লাইট অফ'}
          </button>
        </div>

        {/* Passenger Pickup/Dropoff Action Banner if at Bus Stop */}
        {canBoardPassengers && (
          <button
            onClick={onPassengerAction}
            className="animate-bounce px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-2xl border-2 border-emerald-300 active:scale-95 transition-all pointer-events-auto"
          >
            🚪 যাত্রী ওঠান / নামান
          </button>
        )}
      </div>

      {/* Bottom Main Driving Controls */}
      <div className="flex items-end justify-between pointer-events-auto w-full pb-1">
        {/* Left Side: Steering Buttons + Horn */}
        <div className="flex flex-col gap-2.5">
          {/* Hydraulic Horn Button */}
          <button
            {...bindHoldEvents(onHornChange)}
            className="w-16 h-12 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl border border-amber-400/60 shadow-lg active:scale-95 flex items-center justify-center text-sm"
          >
            📯 হর্ন
          </button>

          {/* Steer Left & Right Buttons */}
          <div className="flex gap-3">
            <button
              {...bindHoldEvents(onSteerLeftChange)}
              className="w-18 h-18 bg-slate-900/90 active:bg-blue-600 text-white font-black text-2xl rounded-2xl border-2 border-slate-700/80 active:border-blue-400 shadow-xl flex items-center justify-center transition-transform active:scale-90"
            >
              ◀
            </button>
            <button
              {...bindHoldEvents(onSteerRightChange)}
              className="w-18 h-18 bg-slate-900/90 active:bg-blue-600 text-white font-black text-2xl rounded-2xl border-2 border-slate-700/80 active:border-blue-400 shadow-xl flex items-center justify-center transition-transform active:scale-90"
            >
              ▶
            </button>
          </div>
        </div>

        {/* Right Side: Gear Selector + Pedals */}
        <div className="flex items-end gap-3.5">
          {/* Gear Lever Column */}
          <div className="flex flex-col gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 shadow-xl">
            {(['D', 'N', 'R'] as GearMode[]).map((gear) => (
              <button
                key={gear}
                onClick={() => onGearChange(gear)}
                className={`w-11 h-9 rounded-lg font-bold text-xs flex items-center justify-center transition-all ${
                  currentGear === gear
                    ? gear === 'D'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/50'
                      : gear === 'R'
                      ? 'bg-red-600 text-white shadow-md shadow-red-500/50'
                      : 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {gear === 'D' ? 'D (ফরওয়ার্ড)' : gear === 'N' ? 'N' : 'R (রিভার্স)'}
              </button>
            ))}

            {/* Handbrake Button */}
            <button
              onClick={onHandbrakeToggle}
              className={`w-11 h-9 rounded-lg font-bold text-xs flex items-center justify-center transition-all mt-1 ${
                isHandbrakeOn
                  ? 'bg-red-700 text-white ring-2 ring-red-400'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              (P)
            </button>
          </div>

          {/* Foot Pedals: Brake and Accelerator */}
          <div className="flex items-end gap-2.5">
            {/* Brake / Reverse Pedal */}
            <button
              {...bindHoldEvents(onBrakeChange)}
              className="w-18 h-24 bg-rose-900/90 active:bg-rose-600 text-white font-bold text-sm rounded-2xl border-2 border-rose-700/80 active:border-rose-400 shadow-2xl flex flex-col items-center justify-center gap-1 transition-transform active:scale-95"
            >
              <div className="w-8 h-1 bg-rose-400 rounded-full" />
              <span>ব্রেক</span>
              <span className="text-[10px] text-rose-300">BRAKE</span>
            </button>

            {/* Accelerator Pedal */}
            <button
              {...bindHoldEvents(onAccelerateChange)}
              className="w-18 h-30 bg-emerald-700/90 active:bg-emerald-500 text-white font-bold text-sm rounded-2xl border-2 border-emerald-500/80 active:border-emerald-300 shadow-2xl flex flex-col items-center justify-center gap-1 transition-transform active:scale-95"
            >
              <div className="w-8 h-1 bg-emerald-300 rounded-full" />
              <span>এক্সিলারেটর</span>
              <span className="text-[10px] text-emerald-200">GAS</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
