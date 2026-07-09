import { NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

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

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const accent: [number, number, number] = [242, 169, 59];
  const dark: [number, number, number] = [15, 33, 56];

  // capa
  doc.setFillColor(...dark);
  doc.rect(0, 0, 595, 842, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text("Relatório de Sondagem SPT", 40, 100);
  doc.setFontSize(13);
  doc.setTextColor(...accent);
  doc.text(obra?.nome_obra || "", 40, 130);
  doc.setTextColor(220, 220, 220);
  doc.setFontSize(10);
  doc.text(`Cliente: ${obra?.cliente || "-"}`, 40, 155);
  doc.text(`Local: ${obra?.rodovia_km || "-"}`, 40, 172);
  doc.text(`Relatório nº: ${obra?.numero_relatorio || "-"}`, 40, 189);
  doc.text(`ART: ${obra?.art || "-"}`, 40, 206);
  doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, 40, 223);

  (furos ?? []).forEach((furo: any) => {
    doc.addPage();
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(15);
    doc.text(`Furo ${furo.codigo}`, 40, 50);
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Nível d'água: ${furo.nivel_agua_m ?? "não encontrado"}   |   Status: ${
        furo.status === "concluido" ? "Concluído" : "Em andamento"
      }`,
      40,
      66
    );

    const leituras = (furo.leituras ?? []).sort(
      (a: any, b: any) => a.profundidade_m - b.profundidade_m
    );

    autoTable(doc, {
      startY: 80,
      head: [["Prof. (m)", "1ª 15cm", "2ª 15cm", "3ª 15cm", "NSPT", "Classificação do material"]],
      body: leituras.map((l: any) => [
        l.profundidade_m,
        l.golpes_1 ?? "-",
        l.golpes_2 ?? "-",
        l.golpes_3 ?? "-",
        l.nspt ?? "-",
        l.classificacao_material ?? "",
      ]),
      headStyles: { fillColor: dark, textColor: 255 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      styles: { fontSize: 9, cellPadding: 5 },
      columnStyles: { 5: { cellWidth: 200 } },
    });
  });

  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  const fileName = `relatorio-spt-${obra?.numero_relatorio || obraId}.pdf`;

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
