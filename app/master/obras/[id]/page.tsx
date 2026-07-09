import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import TopBar from "@/components/TopBar";
import NsptChart from "@/components/NsptChart";

export default async function ObraReportPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: obra } = await supabase.from("obras").select("*").eq("id", params.id).single();
  const { data: furos } = await supabase
    .from("furos")
    .select("*, leituras(*)")
    .eq("obra_id", params.id)
    .order("codigo");

  return (
    <div className="page">
      <TopBar role="master" />
      <main className="container" style={{ padding: "24px 20px 60px" }}>
        <Link href="/master" className="text-dim" style={{ fontSize: 13, textDecoration: "none" }}>
          ← Painel Master
        </Link>

        <div className="spread" style={{ marginTop: 8, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22 }}>{obra?.nome_obra}</h1>
            <p className="text-dim" style={{ fontSize: 14, marginTop: 4 }}>
              {obra?.cliente} · {obra?.rodovia_km} · Relatório {obra?.numero_relatorio}
              {obra?.art ? ` · ART ${obra.art}` : ""}
            </p>
          </div>
          <div className="row">
            <a className="btn" href={`/api/export/excel?obraId=${params.id}`}>
              ⬇ Excel
            </a>
            <a className="btn btn-primary" href={`/api/export/pdf?obraId=${params.id}`}>
              ⬇ PDF
            </a>
          </div>
        </div>

        <div className="stack" style={{ marginTop: 24, gap: 16 }}>
          {furos && furos.length > 0 ? (
            furos.map((furo: any) => (
              <div key={furo.id} className="card">
                <div className="spread" style={{ marginBottom: 8 }}>
                  <h3 className="mono" style={{ fontSize: 16 }}>
                    {furo.codigo}
                  </h3>
                  <span
                    className={`badge ${
                      furo.status === "concluido" ? "badge-concluido" : "badge-andamento"
                    }`}
                  >
                    {furo.status === "concluido" ? "Concluído" : "Em andamento"}
                  </span>
                </div>
                <p className="text-dim" style={{ fontSize: 13, marginBottom: 8 }}>
                  {furo.leituras?.length ?? 0} leituras
                  {furo.nivel_agua_m ? ` · N.A. ${furo.nivel_agua_m} m` : ""}
                </p>

                {furo.leituras && furo.leituras.length > 0 ? (
                  <NsptChart leituras={furo.leituras} />
                ) : (
                  <p className="text-dim" style={{ fontSize: 13 }}>
                    Sem leituras lançadas ainda.
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="card text-dim">Nenhum furo cadastrado nesta obra.</div>
          )}
        </div>
      </main>
    </div>
  );
}
