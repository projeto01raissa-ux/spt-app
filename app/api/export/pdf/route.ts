import { NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

async function baixarImagemBase64(url: string): Promise<{ data: string; format: "JPEG" | "PNG" } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") || "";
    const format: "JPEG" | "PNG" = contentType.includes("png") ? "PNG" : "JPEG";
    const buffer = Buffer.from(await res.arrayBuffer());
    return { data: `data:${contentType};base64,${buffer.toString("base64")}`, format };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const obraId = req.nextUrl.searchParams.get("obraId");
  if (!obraId) {
    return NextResponse.json({ error: "obraId é obrigatório" }, { status: 400 });
  }

  const supabase = createClient();
  const { data: obra } = await supabase.from("obras").select("*").eq("id", obraId).single();
  const { data: furos } = await supabase
    .from("furos")
    .select("*, leituras(*), fotos(*)")
    .eq("obra_id", obraId)
    .order("codigo");

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const accent: [number, number, number] = [242, 169, 59];
  const dark: [number, number, number] = [15, 33, 56];
  const pageHeight = 842;
  const pageWidth = 595;

  // capa
  doc.setFillColor(...dark);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
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

  for (const furo of furos ?? []) {
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

    // ---- registro fotográfico ----
    const fotos = furo.fotos ?? [];
    if (fotos.length > 0) {
      let y = (doc as any).lastAutoTable.finalY + 30;

      if (y > pageHeight - 200) {
        doc.addPage();
        y = 50;
      }

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text("Registro fotográfico", 40, y);
      y += 15;

      const imgSize = 150;
      const gap = 15;
      let x = 40;
      let colCount = 0;
      const maxCols = 3;

      for (const foto of fotos) {
        const url = supabase.storage.from("fotos-campo").getPublicUrl(foto.storage_path).data
          .publicUrl;
        const imagem = await baixarImagemBase64(url);

        if (colCount === maxCols) {
          colCount = 0;
          x = 40;
          y += imgSize + gap;
        }

        if (y + imgSize > pageHeight - 40) {
          doc.addPage();
          y = 50;
          x = 40;
          colCount = 0;
        }

        if (imagem) {
          try {
            doc.addImage(imagem.data, imagem.format, x, y, imgSize, imgSize, undefined, "FAST");
          } catch {
            doc.setDrawColor(200, 200, 200);
            doc.rect(x, y, imgSize, imgSize);
            doc.setFontSize(8);
            doc.text("Falha ao carregar imagem", x + 10, y + imgSize / 2);
          }
        } else {
          doc.setDrawColor(200, 200, 200);
          doc.rect(x, y, imgSize, imgSize);
          doc.setFontSize(8);
          doc.text("Foto indisponível", x + 10, y + imgSize / 2);
        }

        x += imgSize + gap;
        colCount++;
      }
    }
  }

  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  const fileName = `relatorio-spt-${obra?.numero_relatorio || obraId}.pdf`;

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
