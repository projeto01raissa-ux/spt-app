import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import TopBar from "@/components/TopBar";
import NovoFuroForm from "@/components/NovoFuroForm";

export default async function ObraPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: obra } = await supabase
    .from("obras")
    .select("*")
    .eq("id", params.id)
    .single();

  const { data: furos } = await supabase
    .from("furos")
    .select("id, codigo, status, data_inicio, leituras(count)")
    .eq("obra_id", params.id)
    .order("codigo");

  return (
    <div className="page">
      <TopBar role="campo" />
      <main className="container" style={{ padding: "24px 20px 60px" }}>
        <Link href="/campo" className="text-dim" style={{ fontSize: 13, textDecoration: "none" }}>
          ← Todas as obras
        </Link>
        <h1 style={{ fontSize: 22, marginTop: 8 }}>{obra?.nome_obra}</h1>
        <p className="text-dim" style={{ fontSize: 14, marginTop: 4 }}>
          {obra?.cliente} · {obra?.rodovia_km} · Relatório {obra?.numero_relatorio}
        </p>

        <div style={{ marginTop: 20 }}>
          <NovoFuroForm obraId={params.id} />
        </div>

        <div className="card" style={{ marginTop: 20, padding: 0 }}>
          {furos && furos.length > 0 ? (
            furos.map((furo: any, i: number) => (
              <Link
                key={furo.id}
                href={`/campo/furos/${furo.id}`}
                style={{
                  display: "block",
                  padding: "16px 20px",
                  borderBottom: i < furos.length - 1 ? "1px solid var(--border)" : "none",
                  textDecoration: "none",
                }}
              >
                <div className="spread">
                  <div>
                    <div style={{ fontWeight: 600 }} className="mono">
                      {furo.codigo}
                    </div>
                    <div className="text-dim" style={{ fontSize: 13 }}>
                      {furo.leituras?.[0]?.count ?? 0} leitura(s) lançada(s)
                    </div>
                  </div>
                  <span
                    className={`badge ${
                      furo.status === "concluido" ? "badge-concluido" : "badge-andamento"
                    }`}
                  >
                    {furo.status === "concluido" ? "Concluído" : "Em andamento"}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div style={{ padding: 20 }} className="text-dim">
              Nenhum furo cadastrado ainda nesta obra.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
