"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function FurosComparativoChart({ furos }: { furos: any[] }) {
  const data = furos
    .map((f: any) => {
      const leituras = f.leituras ?? [];
      const nspts = leituras.map((l: any) => l.nspt).filter((n: any) => n != null);
      const maxNspt = nspts.length > 0 ? Math.max(...nspts) : 0;
      const profundidadeMax =
        leituras.length > 0
          ? Math.max(...leituras.map((l: any) => Number(l.profundidade_m)))
          : 0;
      return {
        codigo: f.codigo,
        maxNspt,
        profundidadeMax,
        concluido: f.status === "concluido",
      };
    })
    .filter((f) => f.maxNspt > 0);

  if (data.length === 0) {
    return (
      <p className="text-dim" style={{ fontSize: 13 }}>
        Ainda não há leituras suficientes pra comparar os furos.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ left: 0, right: 10 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
        <XAxis dataKey="codigo" stroke="var(--text-dim)" fontSize={12} />
        <YAxis
          stroke="var(--text-dim)"
          fontSize={12}
          label={{
            value: "NSPT máx.",
            angle: -90,
            position: "insideLeft",
            fill: "var(--text-dim)",
            fontSize: 12,
          }}
        />
        <Tooltip
          contentStyle={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(value: any, name: any, props: any) => [
            `${value} golpes`,
            `Prof. máx. ${props.payload.profundidadeMax}m`,
          ]}
        />
        <Bar dataKey="maxNspt" radius={[6, 6, 0, 0]}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.concluido ? "var(--accent-2)" : "var(--accent)"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
