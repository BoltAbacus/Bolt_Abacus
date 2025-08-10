import { FC, useMemo, useRef, useState } from 'react';

export interface LineChartProps {
  data: number[];
  labels?: string[];
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
  minValue?: number;
  maxValue?: number;
  valueFormatter?: (v: number) => string;
  yTicks?: number[];
  showDots?: boolean;
}

// Simple responsive inline SVG polyline chart with optional area fill
const LineChart: FC<LineChartProps> = ({
  data,
  labels,
  width = 260,
  height = 90,
  stroke = '#60a5fa', // blue-400
  fill = 'rgba(96,165,250,0.15)',
  minValue,
  maxValue,
  valueFormatter,
  yTicks,
  showDots = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ i: number; x: number; y: number; leftPct: number; topPct: number } | null>(null);

  const { points, areaPath } = useMemo(() => {
    const n = data.length;
    if (n === 0) return { points: '', areaPath: '' };

    const min = minValue ?? Math.min(...data);
    const max = maxValue ?? Math.max(...data);
    const range = max - min || 1;

    const xStep = width / Math.max(1, n - 1);

    const toPoint = (v: number, i: number) => {
      const x = i * xStep;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    };

    const pts = data.map((v, i) => toPoint(v, i)).join(' ');
    const first = `0,${height}`;
    const last = `${(n - 1) * xStep},${height}`;
    const area = `M ${first} L ${pts} L ${last} Z`;
    return { points: pts, areaPath: area };
  }, [data, width, height, minValue, maxValue]);

  const min = minValue ?? Math.min(...data);
  const max = maxValue ?? Math.max(...data);
  const range = max - min || 1;
  const xStep = width / Math.max(1, data.length - 1);

  const handleMouseMove: React.MouseEventHandler<SVGSVGElement> = (e) => {
    const bbox = e.currentTarget.getBoundingClientRect();
    const xPx = e.clientX - bbox.left;
    const yPx = e.clientY - bbox.top;
    const i = Math.max(0, Math.min(data.length - 1, Math.round((xPx / bbox.width) * (data.length - 1))));
    const x = i * xStep;
    const y = height - ((data[i] - min) / range) * height;
    setHover({ i, x, y, leftPct: (xPx / bbox.width) * 100, topPct: (yPx / bbox.height) * 100 });
  };

  const handleLeave = () => setHover(null);

  const valueFmt = (v: number) => (valueFormatter ? valueFormatter(v) : String(v));

  return (
    <div ref={containerRef} className="relative">
      <svg
        width="100%"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleLeave}
      >
        {/* Grid */}
        {yTicks?.map((t, idx) => {
          const y = height - ((t - min) / range) * height;
          return (
            <g key={idx}>
              <line x1={0} y1={y} x2={width} y2={y} stroke="#ffffff" strokeOpacity={0.08} strokeDasharray="4 4" />
              <text x={2} y={y - 2} fontSize={8} fill="#aaa">{t}</text>
            </g>
          );
        })}
        <path d={areaPath} fill={fill} stroke="none" />
        <polyline
          points={points}
          fill="none"
          stroke={stroke}
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
        />
        {showDots &&
          data.map((v, i) => {
            const x = i * xStep;
            const y = height - ((v - min) / range) * height;
            return <circle key={i} cx={x} cy={y} r={3.5} fill="#fff" stroke={stroke} strokeWidth={2} />;
          })}
        {hover && (
          <g>
            <line x1={hover.x} y1={0} x2={hover.x} y2={height} stroke={stroke} strokeOpacity={0.4} />
            <circle cx={hover.x} cy={height - ((data[hover.i] - min) / range) * height} r={3.5} fill={stroke} stroke="#fff" strokeWidth={1} />
          </g>
        )}
      </svg>
      {hover && (
        <div
          className="absolute pointer-events-none bg-black/90 text-white text-[10px] px-2 py-1 rounded border border-white/10 shadow-lg"
          style={{ left: `calc(${hover.leftPct}% + 6px)`, top: `calc(${hover.topPct}% - 28px)` }}
        >
          <div className="font-semibold">{valueFmt(data[hover.i])}</div>
          {labels?.[hover.i] && <div className="text-gray-300">{labels[hover.i]}</div>}
        </div>
      )}
    </div>
  );
};

export default LineChart;

