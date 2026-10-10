import React, { useState } from 'react';
import { GameSettings, GraphicsQuality, TrafficDensity, TimeOfDay, WeatherType } from '../types/game';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onResetProgress,
  onClose,
}) => {
  const [current, setCurrent] = useState<GameSettings>({ ...settings });
  const [confirmReset, setConfirmReset] = useState(false);

  const update = (partial: Partial<GameSettings>) => {
    const updated = { ...current, ...partial };
    setCurrent(updated);
    onUpdateSettings(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 select-none animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <h2 className="text-xl font-black text-amber-400">গেম সেটিংস (Settings)</h2>
            <p className="text-xs text-slate-400">গ্রাফিক্স, ট্রাফিক, পরিবেশ ও নিয়ন্ত্রণ কাস্টমাইজ করুন</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Options List */}
        <div className="p-4 md:p-6 overflow-y-auto flex flex-col gap-5 text-xs text-slate-300">
          {/* Graphics Quality */}
          <div className="flex flex-col gap-2">
            <label className="font-bold text-slate-200">গ্রাফিক্স কোয়ালিটি (Graphics Quality):</label>
            <div className="grid grid-cols-3 gap-2">
              {(['LOW', 'MEDIUM', 'HIGH'] as GraphicsQuality[]).map((g) => (
                <button
                  key={g}
                  onClick={() => update({ graphicsQuality: g })}
                  className={`py-2 rounded-xl font-bold border transition-all ${
                    current.graphicsQuality === g
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {g === 'LOW' ? 'লো (স্মার্টফোন)' : g === 'MEDIUM' ? 'মাঝারি' : 'হাই (পিসি)'}
                </button>
              ))}
            </div>
          </div>

          {/* Traffic Density */}
          <div className="flex flex-col gap-2">
            <label className="font-bold text-slate-200">ট্রাফিক ঘনত্ব (Traffic Density):</label>
            <div className="grid grid-cols-3 gap-2">
              {(['LOW', 'MEDIUM', 'HIGH'] as TrafficDensity[]).map((d) => (
                <button
                  key={d}
                  onClick={() => update({ trafficDensity: d })}
                  className={`py-2 rounded-xl font-bold border transition-all ${
                    current.trafficDensity === d
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {d === 'LOW' ? 'কম (হালকা)' : d === 'MEDIUM' ? 'স্বাভাবিক' : 'ব্যস্ত মোড়'}
                </button>
              ))}
            </div>
          </div>

          {/* Time of Day */}
          <div className="flex flex-col gap-2">
            <label className="font-bold text-slate-200">দিনের সময় (Time of Day):</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT'] as TimeOfDay[]).map((t) => (
                <button
                  key={t}
                  onClick={() => update({ timeOfDay: t })}
                  className={`py-2 rounded-xl font-bold text-[11px] border transition-all ${
                    current.timeOfDay === t
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {t === 'MORNING' ? '🌅 সকাল' : t === 'AFTERNOON' ? '☀️ দুপুর' : t === 'EVENING' ? '🌇 বিকেল' : '🌙 রাত'}
                </button>
              ))}
            </div>
          </div>

          {/* Weather */}
          <div className="flex flex-col gap-2">
            <label className="font-bold text-slate-200">আবহাওয়া (Weather):</label>
            <div className="grid grid-cols-3 gap-2">
              {(['SUNNY', 'CLOUDY', 'RAIN'] as WeatherType[]).map((w) => (
                <button
                  key={w}
                  onClick={() => update({ weather: w })}
                  className={`py-2 rounded-xl font-bold border transition-all ${
                    current.weather === w
                      ? 'bg-blue-500/20 border-blue-400 text-blue-300 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {w === 'SUNNY' ? '☀️ রোদ' : w === 'CLOUDY' ? '☁️ মেঘলা' : '🌧️ বৃষ্টি'}
                </button>
              ))}
            </div>
          </div>

          {/* Sound Volume Slider */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between font-bold text-slate-200">
              <span>সাউন্ড ভলিউম (Sound Volume):</span>
              <span className="text-amber-400 font-speedo">{Math.round(current.soundVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={current.soundVolume}
              onChange={(e) => update({ soundVolume: parseFloat(e.target.value) })}
              className="w-full accent-amber-400"
            />
          </div>

          {/* Reset Save Data */}
          <div className="pt-3 border-t border-slate-800">
            {confirmReset ? (
              <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl flex items-center justify-between gap-3">
                <span className="text-[11px] text-rose-300 font-bold">সব তথ্য মুছে ফেলবেন?</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onResetProgress();
                      setConfirmReset(false);
                      onClose();
                    }}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs"
                  >
                    হ্যাঁ, মুছুন
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs"
                  >
                    না
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmReset(true)}
                className="text-xs text-rose-400 hover:text-rose-300 underline"
              >
                🗑️ গেমের ডাটা রিসেট করুন (Reset All Saved Data)
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl transition-all"
          >
            ঠিক আছে (Save & Close)
          </button>
        </div>
      </div>
    </div>
  );
};
