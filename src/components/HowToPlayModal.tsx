import React from 'react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 select-none animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <h2 className="text-xl font-black text-amber-400">খেলার নিয়ম ও নিয়ন্ত্রণ (Controls)</h2>
            <p className="text-xs text-slate-400">মোবাইল টাচ এবং কম্পিউটার কিবোর্ড কন্ট্রোল গাইড</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all text-sm font-bold"
          >
            ✕
          </button>
        </div>

        <div className="p-4 md:p-6 overflow-y-auto flex flex-col gap-4 text-xs text-slate-300">
          {/* Objective */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5">
            <h3 className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
              <span>🎯</span> মূল লক্ষ্য (Objective):
            </h3>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              আমিনপুরের বাস টার্মিনাল বা নির্ধারিত স্টপেজে গিয়ে যাত্রী তুলুন, গ্রামীণ হেরিংবোন ও হাইওয়ে সড়কের সিএনজি-রিকশা এড়িয়ে সাবধানে গন্তব্যে গাড়ি চালিয়ে নামিয়ে দিয়ে ভাড়া ও অভিজ্ঞতা (XP) উপার্জন করুন!
            </p>
          </div>

          {/* Mobile Touch Controls */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5">
            <h3 className="font-bold text-amber-400 mb-2 flex items-center gap-1.5">
              <span>📱</span> মোবাইল টাচ কন্ট্রোল (Touch Controls):
            </h3>
            <ul className="space-y-1.5 text-[11px] text-slate-300 list-disc list-inside">
              <li><strong>ডান পাশের সবুজ প্যাডেল:</strong> এক্সিলারেটর / গ্যাস (সামনে চলতে চাপুন)</li>
              <li><strong>ডান পাশের লাল প্যাডেল:</strong> ব্রেক ও রিভার্স (থামতে চাপুন)</li>
              <li><strong>বাম পাশের ◀ ▶ বাটন:</strong> ডানে ও বাঁয়ে স্টিয়ারিং ঘোরান</li>
              <li><strong>D / N / R বাটন:</strong> ফরওয়ার্ড গিয়ার, নিউট্রাল ও ব্যাক গিয়ার বদল</li>
              <li><strong>হর্ন বাটন (📯):</strong> ঐতিহ্যবাহী হাইড্রোলিক হর্ন বাজাতে চাপুন</li>
              <li><strong>যাত্রী বাটন (🚪):</strong> স্টপেজে বাস থামলে যাত্রী ওঠাতে বা নামাতে চাপুন</li>
            </ul>
          </div>

          {/* Desktop Keyboard */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5">
            <h3 className="font-bold text-sky-400 mb-2 flex items-center gap-1.5">
              <span>⌨️</span> কম্পিউটার কিবোর্ড (Desktop Keys):
            </h3>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-amber-300 font-bold">W</kbd> বা <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-amber-300">↑</kbd> : গতি বৃদ্ধি</div>
              <div><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-rose-300 font-bold">S</kbd> বা <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-rose-300">↓</kbd> : ব্রেক / রিভার্স</div>
              <div><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-sky-300 font-bold">A / D</kbd> : বাঁয়ে ও ডানে মোড়</div>
              <div><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-200 font-bold">Space</kbd> : হ্যান্ডব্রেক</div>
              <div><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-amber-300 font-bold">H</kbd> : হাইড্রোলিক হর্ন</div>
              <div><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-emerald-300 font-bold">E</kbd> : যাত্রী দরজা খোলা</div>
              <div><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-200 font-bold">C</kbd> : ক্যামেরা ভিউ বদল</div>
              <div><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-yellow-300 font-bold">L</kbd> : হেডলাইট আলো</div>
            </div>
          </div>
        </div>

        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl transition-all"
          >
            বুঝেছি, খেলা শুরু করুন
          </button>
        </div>
      </div>
    </div>
  );
};
