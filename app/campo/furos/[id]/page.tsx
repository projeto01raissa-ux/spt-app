import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import TopBar from "@/components/TopBar";
import FuroEditor from "@/components/FuroEditor";

export default async function FuroPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: furo } = await supabase.from("furos").select("*, obras(nome_obra)").eq("id", params.id).single();
  const { data: leituras } = await supabase
    .from("leituras")
    .select("*")
    .eq("furo_id", params.id)
    .order("profundidade_m");
  const { data: fotos } = await supabase
    .from("fotos")
    .select("*")
    .eq("furo_id", params.id)
    .order("created_at");

  return (
    <div className="page">
      <TopBar role="campo" />
      <main className="container" style={{ padding: "24px 20px 60px" }}>
        <Link
          href={`/campo/obras/${furo?.obra_id}`}
          className="text-dim"
          style={{ fontSize: 13, textDecoration: "none" }}
        >
          ← {(furo as any)?.obras?.nome_obra}
        </Link>
        <h1 style={{ fontSize: 22, marginTop: 8 }} className="mono">
          {furo?.codigo}
        </h1>

        <FuroEditor furo={furo} leiturasIniciais={leituras ?? []} fotosIniciais={fotos ?? []} />
      </main>
    </div>
  );
}
