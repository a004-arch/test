import { DOMAINS, DomainKey } from '../data/spendingData';

interface RadarChartProps {
  scores: Record<DomainKey, number>;
  compact?: boolean;
}

export function RadarChart({ scores, compact = false }: RadarChartProps) {
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
    return { ...pointAt(idx, ratio), score: sc, label: d.short };
  });

  const userPolygonPoints = userPoints.map((p) => `${p.x},${p.y}`).join(' ');

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
            <g key={d.key}>
              <circle
                cx={up.x}
                cy={up.y}
                r={4.2}
                fill="#1F4E3D"
                stroke="#FFFFFF"
                strokeWidth={1.8}
              />
              <text
                x={lx}
                y={lp.y - 3}
                textAnchor={anchor}
                fontSize="11.5"
                fontWeight="600"
                fill="#1E1D1A"
              >
                {d.short}
              </text>
              <text
                x={lx}
                y={lp.y + 12}
                textAnchor={anchor}
                fontSize="11"
                fontWeight="600"
                fill="#1F4E3D"
                style={{ fontFamily: 'IBM Plex Mono, monospace' }}
              >
                {up.score}점
              </text>
            </g>
          );
        })}
      </svg>

      <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-[#57534C] mt-1">
        <span className="inline-flex items-center gap-2">
          <span className="w-3 h-3 rounded-xs bg-[#1F4E3D]/25 border border-[#1F4E3D] inline-block" />
          <span>측정 역량 분포</span>
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="w-4 border-t-2 border-dashed border-[#B5781D] inline-block" />
          <span>권장 기준선 (70점)</span>
        </span>
      </div>
    </div>
  );
}
