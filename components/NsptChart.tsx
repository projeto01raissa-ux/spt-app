"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function NsptChart({ leituras }: { leituras: any[] }) {
  const data = leituras
    .slice()
    .sort((a, b) => a.profundidade_m - b.profundidade_m)
    .map((l) => ({
      profundidade: Number(l.profundidade_m),
      nspt: l.nspt,
      material: l.classificacao_material,
    }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.08)" horizontal={false} />
        <XAxis
          type="number"
          dataKey="nspt"
          stroke="var(--text-dim)"
          fontSize={12}
          label={{ value: "NSPT (golpes)", position: "insideBottom", offset: -5, fill: "var(--text-dim)", fontSize: 12 }}
        />
        <YAxis
          type="category"
          dataKey="profundidade"
          reversed
          stroke="var(--text-dim)"
          fontSize={12}
          width={36}
          label={{ value: "Prof. (m)", angle: -90, position: "insideLeft", fill: "var(--text-dim)", fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelFormatter={(v) => `Profundidade: ${v} m`}
          formatter={(value: any, name: any, props: any) => [
            `${value} golpes`,
            props.payload.material || "NSPT",
          ]}
        />
        <Area
          type="monotone"
          dataKey="nspt"
          fill="var(--accent)"
          fillOpacity={0.12}
          stroke="none"
        />
        <Line
          type="monotone"
          dataKey="nspt"
          stroke="var(--accent)"
          strokeWidth={2}
          dot={{ r: 3, fill: "var(--accent)" }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
