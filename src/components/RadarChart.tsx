import { useState } from 'react';
import { DOMAINS, DomainKey } from '../data/spendingData';

interface RadarChartProps {
  scores: Record<DomainKey, number>;
  compact?: boolean;
}

export function RadarChart({ scores, compact = false }: RadarChartProps) {
  const [focusedDomain, setFocusedDomain] = useState<DomainKey | null>(null);

  const cx = 170;
  const cy = 140;
  const maxR = compact ? 84 : 92;

  const angleForIndex = (i: number) => -Math.PI / 2 + i * ((2 * Math.PI) / 6);
  const pointAt = (i: number, ratio: number) => {
    const ang = angleForIndex(i);
    return {
      x: Number((cx + maxR * ratio * Math.cos(ang)).toFixed(1)),
      y: Number((cy + maxR * ratio * Math.sin(ang)).toFixed(1)),
    };
  };

  const levels = [0.25, 0.5, 0.75, 1];
  const benchmarkPoints = DOMAINS.map((_, idx) => {
    const p = pointAt(idx, 0.7);
    return `${p.x},${p.y}`;
  }).join(' ');

  const userPoints = DOMAINS.map((d, idx) => {
    const sc = scores[d.key];
    const ratio = Math.max(0.08, sc / 100);
    return { ...pointAt(idx, ratio), score: sc, label: d.short, key: d.key };
  });

  const userPolygonPoints = userPoints.map((p) => `${p.x},${p.y}`).join(' ');
  const activeDomainMeta = focusedDomain
    ? DOMAINS.find((d) => d.key === focusedDomain)
    : null;
  const activeScore = focusedDomain ? scores[focusedDomain] : null;
  const benchmarkGap = activeScore !== null ? activeScore - 70 : null;

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox="0 0 340 282"
        className="w-full max-w-[340px] h-auto overflow-visible"
        role="img"
        aria-label="6대 소비 역량 육각형 레이더 차트"
      >
        {levels.map((level) => {
          const pts = DOMAINS.map((_, idx) => {
            const p = pointAt(idx, level);
            return `${p.x},${p.y}`;
          }).join(' ');
          return (
            <polygon
              key={level}
              points={pts}
              fill={level === 1 ? '#FFFFFF' : 'none'}
              stroke={level === 1 ? '#CFC7B7' : '#E5DFD3'}
              strokeWidth={level === 1 ? 1.3 : 0.9}
            />
          );
        })}

        {DOMAINS.map((d, idx) => {
          const p = pointAt(idx, 1);
          return (
            <line
              key={d.key}
              x1={cx}
              y1={cy}
              x2={p.x}
              y2={p.y}
              stroke="#EAE4D7"
              strokeWidth={1}
            />
          );
        })}

        <polygon
          points={benchmarkPoints}
          fill="none"
          stroke="#B5781D"
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />

        <polygon
          points={userPolygonPoints}
          fill="rgba(31, 78, 61, 0.16)"
          stroke="#1F4E3D"
          strokeWidth={2.2}
          strokeLinejoin="round"
        />

        {DOMAINS.map((d, idx) => {
          const up = userPoints[idx];
          const lp = pointAt(idx, 1.28);
          const isFocused = focusedDomain === d.key;
          let anchor: 'middle' | 'start' | 'end' = 'middle';
          if (idx === 1 || idx === 2) anchor = 'start';
          if (idx === 4 || idx === 5) anchor = 'end';

          const lx =
            idx === 1 || idx === 2
              ? lp.x - 4
              : idx === 4 || idx === 5
              ? lp.x + 4
              : lp.x;

          return (
            <g
              key={d.key}
              className="cursor-pointer"
              onMouseEnter={() => setFocusedDomain(d.key)}
              onMouseLeave={() => setFocusedDomain(null)}
              onClick={() =>
                setFocusedDomain((curr) => (curr === d.key ? null : d.key))
              }
            >
              <circle cx={up.x} cy={up.y} r={14} fill="transparent" />
              <circle
                cx={up.x}
                cy={up.y}
                r={isFocused ? 6 : 4.2}
                fill={isFocused ? '#B5781D' : '#1F4E3D'}
                stroke="#FFFFFF"
                strokeWidth={1.8}
              />
              <text
                x={lx}
                y={lp.y - 3}
                textAnchor={anchor}
                fontSize="11.5"
                fontWeight="600"
                fill={isFocused ? '#1F4E3D' : '#1E1D1A'}
              >
                {d.short}
              </text>
              <text
                x={lx}
                y={lp.y + 12}
                textAnchor={anchor}
                fontSize="11"
                fontWeight="600"
                fill={isFocused ? '#B5781D' : '#1F4E3D'}
                style={{ fontFamily: 'IBM Plex Mono, monospace' }}
              >
                {up.score}점
              </text>
            </g>
          );
        })}
      </svg>

      <div className="w-full pt-2 mt-1 border-t border-[#E5DFD3]/70 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#57534C]">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#1F4E3D]/25 border border-[#1F4E3D] inline-block" />
            <span>측정 역량</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3.5 border-t-2 border-dashed border-[#B5781D] inline-block" />
            <span>기준선 70점</span>
          </span>
        </div>

        <span className="font-mono tabular-nums text-[11.5px] text-[#1E1D1A] min-h-[18px]">
          {activeDomainMeta && activeScore !== null && benchmarkGap !== null
            ? `${activeDomainMeta.short} ${activeScore}점 (기준선 ${
                benchmarkGap >= 0 ? `+${benchmarkGap}` : benchmarkGap
              }점)`
            : '꼭짓점을 선택하면 기준선 대비 격차를 확인합니다'}
        </span>
      </div>
    </div>
  );
}
