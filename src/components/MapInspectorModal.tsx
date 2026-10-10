import React, { useState } from 'react';
import { ROAD_NODES, ROAD_SEGMENTS, BUS_STOPS, validateMapData, MAP_CENTER_LABEL } from '../data/mapData';

interface MapInspectorModalProps {
  onClose: () => void;
}

export const MapInspectorModal: React.FC<MapInspectorModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'graph' | 'nodes' | 'segments' | 'stops' | 'editor'>('graph');
  const validation = validateMapData();

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 select-none animate-fadeIn">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <h2 className="text-xl font-black text-amber-400">
              আমিনপুর ম্যাপ ও রোড নেটওয়ার্ক ইন্সপেক্টর (Map System)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              ভৌগোলিক তথ্য: {MAP_CENTER_LABEL}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="p-3 bg-slate-950/40 border-b border-slate-800 flex gap-2 overflow-x-auto text-xs">
          {[
            { id: 'graph', label: '📊 নেটওয়ার্ক স্ট্যাটাস' },
            { id: 'nodes', label: `📍 রোড নোড (${ROAD_NODES.length})` },
            { id: 'segments', label: `🛣️ সড়ক সেগমেন্ট (${ROAD_SEGMENTS.length})` },
            { id: 'stops', label: `🚏 বাস স্টপ (${BUS_STOPS.length})` },
            { id: 'editor', label: '🛠️ ডেভেলপার গাইড ও এক্সটেনশন' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-slate-950 shadow-md'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 text-xs text-slate-300">
          {activeTab === 'graph' && (
            <div className="flex flex-col gap-4">
              {/* Validation Status Card */}
              <div
                className={`p-4 rounded-2xl border ${
                  validation.valid
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                }`}
              >
                <div className="font-bold text-sm mb-1">
                  {validation.valid ? '✓ রোড গ্রাফ সম্পূর্ণ বৈধ ও সংযুক্ত!' : '⚠️ ম্যাপ ডাটাতে ত্রুটি পাওয়া গেছে:'}
                </div>
                {validation.valid ? (
                  <p className="text-[11px] text-emerald-400">
                    সকল রোড সেগমেন্ট, ইন্টারসেকশন মোড় এবং যাত্রী বাস স্টপেজ সঠিকভাবে গ্রাফ নেটওয়ার্কে যুক্ত রয়েছে। AI ট্রাফিক ও বাস নেভিগেশন সচল রয়েছে।
                  </p>
                ) : (
                  <ul className="list-disc list-inside space-y-1 text-[11px]">
                    {validation.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Geographic Info summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-lg font-black text-amber-400 font-speedo">{ROAD_NODES.length}</div>
                  <div className="text-[10px] text-slate-400">রোড নোডস (Nodes)</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-lg font-black text-amber-400 font-speedo">{ROAD_SEGMENTS.length}</div>
                  <div className="text-[10px] text-slate-400">কানেক্টেড সেগমেন্ট</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-lg font-black text-amber-400 font-speedo">{BUS_STOPS.length}</div>
                  <div className="text-[10px] text-slate-400">বাস স্টপেজ পয়েন্ট</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-lg font-black text-amber-400 font-speedo">1600m²</div>
                  <div className="text-[10px] text-slate-400">অন্বেষণযোগ্য এলাকা</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'nodes' && (
            <div className="space-y-2">
              {ROAD_NODES.map((node) => (
                <div
                  key={node.id}
                  className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-200">{node.name || node.id}</div>
                    <div className="text-[10px] text-slate-400 font-mono">ID: {node.id}</div>
                  </div>
                  <div className="text-[11px] text-amber-400 font-speedo">
                    X: {node.x}m, Z: {node.z}m
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'segments' && (
            <div className="space-y-2">
              {ROAD_SEGMENTS.map((seg) => (
                <div
                  key={seg.id}
                  className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2"
                >
                  <div>
                    <div className="font-bold text-slate-200">{seg.id}</div>
                    <div className="text-[10px] text-slate-400">
                      সংযুক্ত: <span className="text-emerald-400">{seg.fromNodeId}</span> ➔ <span className="text-emerald-400">{seg.toNodeId}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span>ধরন: <strong className="text-slate-200">{seg.type}</strong></span>
                    <span>প্রস্থ: <strong className="text-slate-200">{seg.width}m</strong></span>
                    <span>গতিসীমা: <strong className="text-amber-400">{seg.speedLimit} km/h</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'stops' && (
            <div className="space-y-2">
              {BUS_STOPS.map((stop) => (
                <div
                  key={stop.id}
                  className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-100">{stop.name}</strong>
                    <span className="text-amber-400 font-speedo text-[11px]">
                      যাত্রী: {stop.passengerCount} জন
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{stop.description}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'editor' && (
            <div className="space-y-3">
              <h4 className="font-bold text-amber-400">কীভাবে নতুন রোড ও স্টপ যুক্ত করবেন:</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                নতুন রাস্তা বা মোড় যোগ করতে <code className="text-emerald-400 font-mono">src/data/mapData.ts</code> ফাইলের <code className="text-emerald-400 font-mono">ROAD_NODES</code> ও <code className="text-emerald-400 font-mono">ROAD_SEGMENTS</code> অ্যারেতে নোড ও সেগমেন্ট সংজ্ঞায়িত করুন।
              </p>
              <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[10px] text-amber-300 font-mono overflow-x-auto">
{`// নতুন সেগমেন্টের কোড উদাহরণ:
{
  id: 'seg_new_road_01',
  fromNodeId: 'node_aminpur_terminal',
  toNodeId: 'node_notun_bazar',
  width: 9,
  lanes: 2,
  type: 'RURAL_PAVED',
  speedLimit: 50
}`}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all"
          >
            বন্ধ করুন (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
