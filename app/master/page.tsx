import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import TopBar from "@/components/TopBar";
import OverviewChart from "@/components/OverviewChart";

export default async function MasterPage() {
  const supabase = createClient();

  const { data: obras } = await supabase
    .from("obras")
    .select("id, nome_obra, cliente, numero_relatorio, created_at, furos(id, status)")
    .order("created_at", { ascending: false });

  const todosFuros = (obras ?? []).flatMap((o: any) => o.furos ?? []);
  const concluidos = todosFuros.filter((f: any) => f.status === "concluido").length;
  const emAndamento = todosFuros.filter((f: any) => f.status !== "concluido").length;

  return (
    <div className="page">
      <TopBar role="master" />
      <main className="container" style={{ padding: "24px 20px 60px" }}>
        <h1 style={{ fontSize: 22 }}>Painel Master</h1>
        <p className="text-dim" style={{ fontSize: 14, marginTop: 4, marginBottom: 20 }}>
          Todas as obras e relatórios de sondagem
        </p>

        <div className="grid-2" style={{ marginBottom: 20 }}>
          <StatCard label="Obras cadastradas" value={obras?.length ?? 0} />
          <StatCard label="Furos concluídos" value={concluidos} />
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, marginBottom: 8 }}>Progresso geral dos furos</h3>
          <OverviewChart concluidos={concluidos} emAndamento={emAndamento} />
        </div>

        <div className="card" style={{ padding: 0 }}>
          {obras && obras.length > 0 ? (
            obras.map((obra: any, i: number) => {
              const total = obra.furos?.length ?? 0;
              const concluidosObra =
                obra.furos?.filter((f: any) => f.status === "concluido").length ?? 0;
              return (
                <Link
                  key={obra.id}
                  href={`/master/obras/${obra.id}`}
                  style={{
                    display: "block",
                    padding: "16px 20px",
                    borderBottom: i < obras.length - 1 ? "1px solid var(--border)" : "none",
                    textDecoration: "none",
                  }}
                >
                  <div className="spread">
                    <div>
                      <div style={{ fontWeight: 600 }}>{obra.nome_obra}</div>
                      <div className="text-dim" style={{ fontSize: 13 }}>
                        {obra.cliente} · Relatório {obra.numero_relatorio}
                      </div>
                    </div>
                    <div className="row">
                      <span className="badge mono">
                        {concluidosObra}/{total} furos
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div style={{ padding: 20 }} className="text-dim">
              Nenhuma obra cadastrada ainda.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="card">
      <div className="text-dim" style={{ fontSize: 13 }}>
        {label}
      </div>
      <div
        className="mono"
        style={{ fontSize: 32, fontWeight: 700, color: "var(--accent)", marginTop: 4 }}
      >
        {value}
      </div>
    </div>
  );
}
