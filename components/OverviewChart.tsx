"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export default function OverviewChart({
  concluidos,
  emAndamento,
}: {
  concluidos: number;
  emAndamento: number;
}) {
  const data = [
    { name: "Concluídos", value: concluidos, color: "#6fd6c4" },
    { name: "Em andamento", value: emAndamento, color: "#f2a93b" },
  ];

  if (concluidos === 0 && emAndamento === 0) {
    return (
      <p className="text-dim" style={{ fontSize: 13 }}>
        Nenhum furo lançado ainda.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={4}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} stroke="var(--surface)" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Legend
          formatter={(value) => <span style={{ color: "var(--text-dim)", fontSize: 12 }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
