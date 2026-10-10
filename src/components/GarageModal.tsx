import React, { useState } from 'react';
import { BusConfig, PlayerProfile } from '../types/game';
import { INITIAL_BUSES } from '../data/busData';

interface GarageModalProps {
  profile: PlayerProfile;
  onSelectBus: (busId: string) => void;
  onBuyBus: (bus: BusConfig) => void;
  onUpgradeBus: (busId: string, upgradeType: 'engine' | 'brakes' | 'handling' | 'fuelTank') => void;
  onClose: () => void;
}

export const GarageModal: React.FC<GarageModalProps> = ({
  profile,
  onSelectBus,
  onBuyBus,
  onUpgradeBus,
  onClose,
}) => {
  const [selectedId, setSelectedId] = useState<string>(profile.selectedBusId);

  const currentBus = INITIAL_BUSES.find((b) => b.id === selectedId) || INITIAL_BUSES[0];
  const isOwned = profile.ownedBusIds.includes(currentBus.id);
  const isCurrentlySelected = profile.selectedBusId === currentBus.id;

  const currentUpgrades = profile.busUpgrades[currentBus.id] || {
    engine: 0,
    brakes: 0,
    handling: 0,
    fuelTank: 0,
  };

  const UPGRADE_COST = 1200;

  return (
    <div className="fixed inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 select-none animate-fadeIn">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-amber-400">
              আমিনপুর বাস গ্যারেজ (Bus Garage)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              বাস সংগ্রহ, আনলক ও পারফরম্যান্স আপগ্রেড করুন
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-amber-500/30 text-amber-400 font-black font-speedo text-sm">
              ৳ {profile.money.toLocaleString()}
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all text-sm font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Bus Carousel / Selector Tabs */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto">
          {INITIAL_BUSES.map((bus) => {
            const owned = profile.ownedBusIds.includes(bus.id);
            const isSelected = bus.id === selectedId;

            return (
              <button
                key={bus.id}
                onClick={() => setSelectedId(bus.id)}
                className={`px-4 py-2.5 rounded-2xl border text-xs md:text-sm font-bold flex items-center gap-2.5 whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-lg'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                }`}
              >
                <div
                  className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-sm"
                  style={{ backgroundColor: bus.color }}
                />
                <span>{bus.name}</span>
                {!owned && <span className="text-[10px] text-amber-500">🔒</span>}
              </button>
            );
          })}
        </div>

        {/* Active Bus Spec & Details */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 flex flex-col md:flex-row gap-6">
          {/* Visual Presentation Card */}
          <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden text-center">
            {/* Color preview bus badge */}
            <div
              className="w-48 h-24 rounded-2xl shadow-2xl border-4 border-slate-700 flex flex-col items-center justify-center p-3 relative mb-4 transition-transform hover:scale-105"
              style={{ backgroundColor: currentBus.color }}
            >
              <div
                className="w-full h-4 rounded-md mb-2 shadow-inner"
                style={{ backgroundColor: currentBus.secondaryColor }}
              />
              <div className="text-slate-950 font-black text-xs uppercase tracking-wider drop-shadow-sm">
                {currentBus.category} COACH
              </div>
              <div className="absolute -bottom-2.5 left-4 w-7 h-7 bg-zinc-900 rounded-full border-2 border-zinc-500" />
              <div className="absolute -bottom-2.5 right-4 w-7 h-7 bg-zinc-900 rounded-full border-2 border-zinc-500" />
            </div>

            <h3 className="text-lg font-black text-slate-100">{currentBus.name}</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">{currentBus.description}</p>

            <div className="mt-4 flex items-center gap-3">
              {isOwned ? (
                <button
                  onClick={() => onSelectBus(currentBus.id)}
                  disabled={isCurrentlySelected}
                  className={`px-6 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all ${
                    isCurrentlySelected
                      ? 'bg-emerald-900/60 border border-emerald-500/50 text-emerald-300 cursor-default'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 active:scale-95 shadow-lg'
                  }`}
                >
                  {isCurrentlySelected ? '✓ সক্রিয় রয়েছে (Active)' : 'এই বাসটি চালান (Drive)'}
                </button>
              ) : (
                <button
                  onClick={() => onBuyBus(currentBus)}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black text-xs md:text-sm rounded-xl shadow-lg active:scale-95 transition-all flex items-center gap-2"
                >
                  <span>কিনুন:</span>
                  <span className="font-speedo">৳ {currentBus.price.toLocaleString()}</span>
                </button>
              )}
            </div>
          </div>

          {/* Performance Stats & Upgrade Tuning Section */}
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                গাড়ির সক্ষমতা ও বৈশিষ্ট্য
              </h4>

              {/* Stats Bars */}
              <div className="space-y-2.5 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>সর্বোচ্চ গতি (Top Speed):</span>
                    <strong className="text-amber-400">{currentBus.maxSpeed} কিমি/ঘণ্টা</strong>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${(currentBus.maxSpeed / 130) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>গতি বৃদ্ধি (Acceleration):</span>
                    <strong className="text-amber-400">{currentBus.acceleration}%</strong>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full"
                      style={{ width: `${currentBus.acceleration}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>ব্রেকিং ক্ষমতা (Braking):</span>
                    <strong className="text-amber-400">{currentBus.braking}%</strong>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-400 rounded-full"
                      style={{ width: `${currentBus.braking}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-300">
                  <div>যাত্রী ধারণক্ষমতা: <strong className="text-slate-100">{currentBus.passengerCapacity} জন</strong></div>
                  <div>জ্বালানি ট্যাংক: <strong className="text-slate-100">{currentBus.fuelCapacity} লিটার</strong></div>
                </div>
              </div>
            </div>

            {/* Performance Upgrades Tuning */}
            {isOwned && (
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    পারফরম্যান্স টিউনিং (Upgrades)
                  </h4>
                  <span className="text-[10px] text-slate-400">প্রতি আপগ্রেড: ৳ {UPGRADE_COST}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'engine', label: 'ইঞ্জিন টিউনিং', icon: '⚡' },
                    { key: 'brakes', label: 'হাইড্রোলিক ব্রেক', icon: '🛑' },
                    { key: 'handling', label: 'সাসপেনশন ও স্টিয়ারিং', icon: '🎯' },
                    { key: 'fuelTank', label: 'বড় ফুয়েল ট্যাংক', icon: '⛽' },
                  ].map((upg) => {
                    const level = (currentUpgrades as Record<string, number>)[upg.key] || 0;
                    const canAfford = profile.money >= UPGRADE_COST;

                    return (
                      <button
                        key={upg.key}
                        disabled={level >= 3 || !canAfford}
                        onClick={() =>
                          onUpgradeBus(
                            currentBus.id,
                            upg.key as 'engine' | 'brakes' | 'handling' | 'fuelTank'
                          )
                        }
                        className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                          level >= 3
                            ? 'bg-slate-950/40 border-slate-800 text-slate-500 opacity-60'
                            : canAfford
                            ? 'bg-slate-900 border-slate-700 hover:border-emerald-500/60 active:scale-95'
                            : 'bg-slate-900/60 border-slate-800 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span>{upg.icon} {upg.label}</span>
                          <span className="text-[10px] text-amber-400 font-speedo">Lvl {level}/3</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {level >= 3 ? 'সর্বোচ্চ পর্যায়' : `আপগ্রেড: ৳${UPGRADE_COST}`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
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
