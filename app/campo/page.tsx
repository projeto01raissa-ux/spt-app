import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import TopBar from "@/components/TopBar";
import NovaObraForm from "@/components/NovaObraForm";

export default async function CampoPage() {
  const supabase = createClient();

  const { data: obras } = await supabase
    .from("obras")
    .select("id, nome_obra, cliente, numero_relatorio, furos(count)")
    .order("created_at", { ascending: false });

  return (
    <div className="page">
      <TopBar role="campo" />
      <main className="container" style={{ padding: "24px 20px 60px" }}>
        <div className="spread" style={{ marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 22 }}>Obras</h1>
            <p className="text-dim" style={{ marginTop: 4, fontSize: 14 }}>
              Selecione uma obra para lançar um novo furo de sondagem
            </p>
          </div>
        </div>

        <NovaObraForm />

        <div className="card" style={{ marginTop: 20, padding: 0 }}>
          {obras && obras.length > 0 ? (
            obras.map((obra: any, i: number) => (
              <Link
                key={obra.id}
                href={`/campo/obras/${obra.id}`}
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
                  <span className="badge mono">
                    {obra.furos?.[0]?.count ?? 0} furo(s)
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div style={{ padding: 20 }} className="text-dim">
              Nenhuma obra cadastrada ainda. Crie a primeira acima.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
