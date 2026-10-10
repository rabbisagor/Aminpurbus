import React from 'react';
import { ROAD_NODES, ROAD_SEGMENTS, BUS_STOPS } from '../data/mapData';
import { BusStop } from '../types/game';

interface MinimapProps {
  playerX: number;
  playerZ: number;
  playerRotationY: number;
  targetStop?: BusStop | null;
}

export const Minimap: React.FC<MinimapProps> = ({
  playerX,
  playerZ,
  playerRotationY,
  targetStop,
}) => {
  // Minimap size
  const mapSize = 130;
  const viewRange = 360; // meters shown in radius
  const scale = mapSize / (viewRange * 2);

  const worldToMap = (wx: number, wz: number) => {
    // Centered around player
    const relX = wx - playerX;
    const relZ = wz - playerZ;
    const mx = mapSize / 2 + relX * scale;
    const my = mapSize / 2 + relZ * scale;
    return { mx, my };
  };

  return (
    <div className="relative w-[130px] h-[130px] rounded-2xl bg-slate-900/90 border-2 border-emerald-500/40 shadow-2xl backdrop-blur-md overflow-hidden pointer-events-none">
      {/* Compass Badge */}
      <div className="absolute top-1 left-2 z-10 text-[10px] font-bold text-emerald-400 tracking-wider">
        GPS আমিনপুর
      </div>

      <svg width={mapSize} height={mapSize} className="w-full h-full">
        {/* Draw Road Segments */}
        {ROAD_SEGMENTS.map((seg) => {
          const from = ROAD_NODES.find((n) => n.id === seg.fromNodeId);
          const to = ROAD_NODES.find((n) => n.id === seg.toNodeId);
          if (!from || !to) return null;

          const p1 = worldToMap(from.x, from.z);
          const p2 = worldToMap(to.x, to.z);

          const isHighway = seg.type === 'HIGHWAY';
          return (
            <line
              key={seg.id}
              x1={p1.mx}
              y1={p1.my}
              x2={p2.mx}
              y2={p2.my}
              stroke={isHighway ? '#facc15' : '#94a3b8'}
              strokeWidth={isHighway ? '3.5' : '2'}
              strokeLinecap="round"
              opacity="0.85"
            />
          );
        })}

        {/* Draw Bus Stops */}
        {BUS_STOPS.map((stop) => {
          const { mx, my } = worldToMap(stop.x, stop.z);
          const isTarget = targetStop?.id === stop.id;

          return (
            <circle
              key={stop.id}
              cx={mx}
              cy={my}
              r={isTarget ? 5 : 2.5}
              fill={isTarget ? '#ef4444' : '#38bdf8'}
              stroke="#ffffff"
              strokeWidth={isTarget ? 1.5 : 0.5}
            />
          );
        })}

        {/* Target Stop Pulsing Ring */}
        {targetStop && (() => {
          const { mx, my } = worldToMap(targetStop.x, targetStop.z);
          return (
            <circle
              cx={mx}
              cy={my}
              r="8"
              fill="none"
              stroke="#ef4444"
              strokeWidth="1.5"
              strokeDasharray="2,2"
              className="animate-spin"
            />
          );
        })()}

        {/* Player Bus Pointer (Center of map with heading arrow) */}
        <g transform={`translate(${mapSize / 2}, ${mapSize / 2}) rotate(${(-playerRotationY * 180) / Math.PI + 180})`}>
          {/* Direction indicator arrow */}
          <polygon points="0,-9 5,7 0,3 -5,7" fill="#22c55e" stroke="#ffffff" strokeWidth="1" />
          <circle cx="0" cy="0" r="3" fill="#15803d" />
        </g>
      </svg>
    </div>
  );
};
