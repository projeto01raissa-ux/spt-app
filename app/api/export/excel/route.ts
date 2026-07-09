import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const obraId = req.nextUrl.searchParams.get("obraId");
  if (!obraId) {
    return NextResponse.json({ error: "obraId é obrigatório" }, { status: 400 });
  }

  const supabase = createClient();
  const { data: obra } = await supabase.from("obras").select("*").eq("id", obraId).single();
  const { data: furos } = await supabase
    .from("furos")
    .select("*, leituras(*)")
    .eq("obra_id", obraId)
    .order("codigo");

  const wb = XLSX.utils.book_new();

  // aba resumo
  const resumo = (furos ?? []).map((f: any) => ({
    Furo: f.codigo,
    Status: f.status,
    "Nível d'água (m)": f.nivel_agua_m ?? "",
    "Data início": f.data_inicio ?? "",
    "Data término": f.data_termino ?? "",
    "Nº leituras": f.leituras?.length ?? 0,
  }));
  const wsResumo = XLSX.utils.json_to_sheet(resumo);
  XLSX.utils.book_append_sheet(wb, wsResumo, "Resumo");

  // aba com todas as leituras
  const todasLeituras: any[] = [];
  (furos ?? []).forEach((f: any) => {
    (f.leituras ?? [])
      .sort((a: any, b: any) => a.profundidade_m - b.profundidade_m)
      .forEach((l: any) => {
        todasLeituras.push({
          Furo: f.codigo,
          "Profundidade (m)": l.profundidade_m,
          "1ª 15cm": l.golpes_1,
          "2ª 15cm": l.golpes_2,
          "3ª 15cm": l.golpes_3,
          NSPT: l.nspt,
          "Classificação do material": l.classificacao_material,
        });
      });
  });
  const wsLeituras = XLSX.utils.json_to_sheet(todasLeituras);
  XLSX.utils.book_append_sheet(wb, wsLeituras, "Leituras");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  const fileName = `relatorio-spt-${obra?.numero_relatorio || obraId}.xlsx`;

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
