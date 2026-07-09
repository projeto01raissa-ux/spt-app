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

// tenta casar a classificação de texto livre com uma cor conhecida do solo
function corDoSolo(texto: string) {
  const t = texto.toLowerCase();
  if (t.includes("areia")) return "#c0392b";
  if (t.includes("argila")) return "#e8c22a";
  if (t.includes("silte")) return "#8d6e63";
  if (t.includes("pedregulho")) return "#7f8c8d";
  return "#f2a93b";
}

export default function SoloChart({ leituras }: { leituras: any[] }) {
  const contagem: Record<string, number> = {};

  leituras.forEach((l: any) => {
    if (!l.classificacao_material) return;
    // pega só a primeira palavra-chave de solo pra agrupar (ex: "Areia siltosa..." -> "Areia")
    const texto = l.classificacao_material.toLowerCase();
    let chave = "Outro";
    if (texto.includes("areia")) chave = "Areia";
    else if (texto.includes("argila")) chave = "Argila";
    else if (texto.includes("silte")) chave = "Silte";
    else if (texto.includes("pedregulho")) chave = "Pedregulho";
    contagem[chave] = (contagem[chave] ?? 0) + 1;
  });

  const data = Object.entries(contagem)
    .map(([tipo, total]) => ({ tipo, total }))
    .sort((a, b) => b.total - a.total);

  if (data.length === 0) {
    return (
      <p className="text-dim" style={{ fontSize: 13 }}>
        Ainda não há classificações de material suficientes.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.08)" horizontal={false} />
        <XAxis type="number" stroke="var(--text-dim)" fontSize={12} allowDecimals={false} />
        <YAxis type="category" dataKey="tipo" stroke="var(--text-dim)" fontSize={12} width={80} />
        <Tooltip
          contentStyle={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(value: any) => [`${value} camada(s)`, "Ocorrências"]}
        />
        <Bar dataKey="total" radius={[0, 6, 6, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={corDoSolo(entry.tipo)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
