import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

function MiniRadial({ label, value, fill }) {
  const data = [{ name: label, value: Math.min(100, Math.max(0, value)), fill }];
  return (
    <div className="flex-1 min-w-[90px]">
      <p className="mb-1 text-center text-[11px] font-medium text-slate-400">
        {label}
      </p>
      <div className="h-32 w-full">
        <ResponsiveContainer>
          <RadialBarChart
            innerRadius="55%"
            outerRadius="100%"
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar dataKey="value" cornerRadius={8} fill={fill} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-center text-sm font-semibold text-slate-100">{value}%</p>
    </div>
  );
}

export default function ConfidenceBar({ weightPct, purityPct, authPct }) {
  return (
    <div className="flex w-full flex-wrap justify-center gap-2">
      <MiniRadial label="Weight band" value={weightPct} fill="#fbbf24" />
      <MiniRadial label="Purity band" value={purityPct} fill="#38bdf8" />
      <MiniRadial label="Authenticity" value={authPct} fill="#34d399" />
    </div>
  );
}
