import { useEffect, useRef, useState } from "react";
import { THROUGHPUT, HOURS } from "../../lib/factoryData";

const W = 560;
const H = 180;
const PAD = 8;

function buildPath(data: number[]) {
  const max = Math.max(...data);
  const stepX = (W - PAD * 2) / (data.length - 1);
  const pts = data.map((v, i) => {
    const x = PAD + i * stepX;
    const y = H - PAD - (v / max) * (H - PAD * 2);
    return [x, y] as const;
  });
  const line = pts.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(" ");
  const area = `${line} L${pts[pts.length - 1][0]},${H} L${pts[0][0]},${H} Z`;
  return { line, area };
}

export default function ThroughputChart() {
  const { line, area } = buildPath(THROUGHPUT);
  const pathRef = useRef<SVGPathElement>(null);
  const [len, setLen] = useState(0);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    if (pathRef.current) setLen(pathRef.current.getTotalLength());
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) setDrawn(true);
  }, []);

  return (
    <div className="rounded-xl border border-steel bg-obsidian/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-faint">Factory Throughput</p>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-steel px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-sig-cyan">
          <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-sig-cyan" /> Live
        </span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        ref={(el) => {
          if (!el) return;
          const io = new IntersectionObserver(
            (e) => {
              if (e[0].isIntersecting) {
                setDrawn(true);
                io.disconnect();
              }
            },
            { threshold: 0.3 },
          );
          io.observe(el);
        }}
      >
        <defs>
          <linearGradient id="tp-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8A56F7" stopOpacity="0.35" />
            <stop offset="1" stopColor="#8A56F7" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1={PAD} x2={W - PAD} y1={H * g} y2={H * g} stroke="#1E1E24" strokeWidth="1" />
        ))}
        <path d={area} fill="url(#tp-fill)" opacity={drawn ? 1 : 0} style={{ transition: "opacity .8s ease" }} />
        <path
          ref={pathRef}
          d={line}
          fill="none"
          stroke="#B338FF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={len}
          strokeDashoffset={drawn ? 0 : len}
          style={{ transition: "stroke-dashoffset 1.4s ease" }}
        />
      </svg>
      <div className="mt-2 flex justify-between font-mono text-[9px] text-faint">
        {HOURS.map((h) => (
          <span key={h}>{h}</span>
        ))}
      </div>
    </div>
  );
}
