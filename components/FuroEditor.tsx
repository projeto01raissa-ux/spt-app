"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Leitura = {
  id?: string;
  profundidade_m: number | string;
  golpes_1: number | string;
  golpes_2: number | string;
  golpes_3: number | string;
  nspt: number | string;
  classificacao_material: string;
};

export default function FuroEditor({
  furo,
  leiturasIniciais,
  fotosIniciais,
}: {
  furo: any;
  leiturasIniciais: any[];
  fotosIniciais: any[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [meta, setMeta] = useState({
    nivel_agua_m: furo?.nivel_agua_m ?? "",
    latitude: furo?.latitude ?? "",
    longitude: furo?.longitude ?? "",
    status: furo?.status ?? "em_andamento",
  });
  const [leituras, setLeituras] = useState<Leitura[]>(leiturasIniciais);
  const [nova, setNova] = useState<Leitura>({
    profundidade_m: leiturasIniciais.length + 1,
    golpes_1: "",
    golpes_2: "",
    golpes_3: "",
    nspt: "",
    classificacao_material: "",
  });
  const [fotos, setFotos] = useState<any[]>(fotosIniciais);
  const [salvandoMeta, setSalvandoMeta] = useState(false);
  const [salvandoLeitura, setSalvandoLeitura] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);

  function nsptCalculado(g2: any, g3: any) {
    const a = Number(g2) || 0;
    const b = Number(g3) || 0;
    return a + b || "";
  }

  async function salvarMeta() {
    setSalvandoMeta(true);
    await supabase
      .from("furos")
      .update({
        nivel_agua_m: meta.nivel_agua_m || null,
        latitude: meta.latitude || null,
        longitude: meta.longitude || null,
        status: meta.status,
        data_termino:
          meta.status === "concluido" ? new Date().toISOString().slice(0, 10) : null,
      })
      .eq("id", furo.id);
    setSalvandoMeta(false);
    router.refresh();
  }

  async function adicionarLeitura(e: React.FormEvent) {
    e.preventDefault();
    setSalvandoLeitura(true);
    const nspt = nova.nspt || nsptCalculado(nova.golpes_2, nova.golpes_3);
    const { data, error } = await supabase
      .from("leituras")
      .insert({
        furo_id: furo.id,
        profundidade_m: Number(nova.profundidade_m),
        golpes_1: nova.golpes_1 ? Number(nova.golpes_1) : null,
        golpes_2: nova.golpes_2 ? Number(nova.golpes_2) : null,
        golpes_3: nova.golpes_3 ? Number(nova.golpes_3) : null,
        nspt: nspt ? Number(nspt) : null,
        classificacao_material: nova.classificacao_material || null,
      })
      .select()
      .single();
    setSalvandoLeitura(false);
    if (!error && data) {
      const atualizadas = [...leituras, data].sort(
        (a, b) => Number(a.profundidade_m) - Number(b.profundidade_m)
      );
      setLeituras(atualizadas);
      setNova({
        profundidade_m: Number(nova.profundidade_m) + 1,
        golpes_1: "",
        golpes_2: "",
        golpes_3: "",
        nspt: "",
        classificacao_material: "",
      });
    }
  }

  async function removerLeitura(id: string) {
    await supabase.from("leituras").delete().eq("id", id);
    setLeituras((l) => l.filter((x) => x.id !== id));
  }

  async function enviarFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setEnviandoFoto(true);
    const path = `${furo.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("fotos-campo")
      .upload(path, file);
    if (!uploadError) {
      const { data } = await supabase
        .from("fotos")
        .insert({ furo_id: furo.id, storage_path: path })
        .select()
        .single();
      if (data) setFotos((f) => [...f, data]);
    }
    setEnviandoFoto(false);
  }

  function urlFoto(path: string) {
    return supabase.storage.from("fotos-campo").getPublicUrl(path).data.publicUrl;
  }

  return (
    <div className="stack" style={{ marginTop: 20, gap: 16 }}>
      {/* metadados do furo */}
      <div className="card">
        <div className="spread" style={{ marginBottom: 14 }}>
          <h3 style={{ fontSize: 16 }}>Dados do furo</h3>
          <span
            className={`badge ${
              meta.status === "concluido" ? "badge-concluido" : "badge-andamento"
            }`}
          >
            {meta.status === "concluido" ? "Concluído" : "Em andamento"}
          </span>
        </div>
        <div className="field-row">
          <div className="field">
            <label>Nível d'água (m)</label>
            <input
              value={meta.nivel_agua_m}
              onChange={(e) => setMeta((m) => ({ ...m, nivel_agua_m: e.target.value }))}
              placeholder="Não encontrado"
            />
          </div>
          <div className="field">
            <label>Latitude</label>
            <input
              value={meta.latitude}
              onChange={(e) => setMeta((m) => ({ ...m, latitude: e.target.value }))}
            />
          </div>
          <div className="field">
            <label>Longitude</label>
            <input
              value={meta.longitude}
              onChange={(e) => setMeta((m) => ({ ...m, longitude: e.target.value }))}
            />
          </div>
        </div>
        <div className="row">
          <button className="btn" onClick={salvarMeta} disabled={salvandoMeta}>
            {salvandoMeta ? "Salvando..." : "Salvar dados do furo"}
          </button>
          {meta.status !== "concluido" && (
            <button
              className="btn btn-primary"
              onClick={() => setMeta((m) => ({ ...m, status: "concluido" }))}
            >
              Marcar como concluído
            </button>
          )}
        </div>
      </div>

      {/* tabela de leituras */}
      <div className="card">
        <h3 style={{ fontSize: 16, marginBottom: 14 }}>Leituras (golpes por profundidade)</h3>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Prof. (m)</th>
                <th>1ª 15cm</th>
                <th>2ª 15cm</th>
                <th>3ª 15cm</th>
                <th>NSPT</th>
                <th>Classificação do material</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {leituras.map((l) => (
                <tr key={l.id}>
                  <td className="mono">{l.profundidade_m}</td>
                  <td className="mono">{l.golpes_1 ?? "-"}</td>
                  <td className="mono">{l.golpes_2 ?? "-"}</td>
                  <td className="mono">{l.golpes_3 ?? "-"}</td>
                  <td className="mono data-value" style={{ color: "var(--accent)" }}>
                    {l.nspt ?? "-"}
                  </td>
                  <td style={{ fontSize: 13 }}>{l.classificacao_material}</td>
                  <td>
                    <button
                      className="btn btn-danger"
                      style={{ padding: "4px 8px", fontSize: 12 }}
                      onClick={() => removerLeitura(l.id!)}
                    >
                      remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form onSubmit={adicionarLeitura} style={{ marginTop: 16 }}>
          <div className="field-row">
            <div className="field">
              <label>Prof. (m)</label>
              <input
                type="number"
                step="1"
                required
                value={nova.profundidade_m}
                onChange={(e) => setNova((n) => ({ ...n, profundidade_m: e.target.value }))}
              />
            </div>
            <div className="field">
              <label>1ª 15cm</label>
              <input
                type="number"
                value={nova.golpes_1}
                onChange={(e) => setNova((n) => ({ ...n, golpes_1: e.target.value }))}
              />
            </div>
            <div className="field">
              <label>2ª 15cm</label>
              <input
                type="number"
                value={nova.golpes_2}
                onChange={(e) => setNova((n) => ({ ...n, golpes_2: e.target.value }))}
              />
            </div>
            <div className="field">
              <label>3ª 15cm</label>
              <input
                type="number"
                value={nova.golpes_3}
                onChange={(e) => setNova((n) => ({ ...n, golpes_3: e.target.value }))}
              />
            </div>
            <div className="field">
              <label>NSPT (auto)</label>
              <input
                type="number"
                placeholder={String(nsptCalculado(nova.golpes_2, nova.golpes_3) || "")}
                value={nova.nspt}
                onChange={(e) => setNova((n) => ({ ...n, nspt: e.target.value }))}
              />
            </div>
          </div>
          <div className="field">
            <label>Classificação do material</label>
            <input
              placeholder="Ex: Areia siltosa, de cor vermelha"
              value={nova.classificacao_material}
              onChange={(e) =>
                setNova((n) => ({ ...n, classificacao_material: e.target.value }))
              }
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={salvandoLeitura}>
            {salvandoLeitura ? "Adicionando..." : "+ Adicionar leitura"}
          </button>
        </form>
      </div>

      {/* fotos */}
      <div className="card">
        <h3 style={{ fontSize: 16, marginBottom: 14 }}>Registro fotográfico</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
            gap: 10,
            marginBottom: 14,
          }}
        >
          {fotos.map((f) => (
            <img
              key={f.id}
              src={urlFoto(f.storage_path)}
              alt=""
              style={{
                width: "100%",
                aspectRatio: "1",
                objectFit: "cover",
                borderRadius: 8,
                border: "1px solid var(--border)",
              }}
            />
          ))}
        </div>
        <label className="btn" style={{ display: "inline-flex", cursor: "pointer" }}>
          {enviandoFoto ? "Enviando..." : "📷 Tirar / enviar foto"}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            onChange={enviarFoto}
            disabled={enviandoFoto}
          />
        </label>
      </div>
    </div>
  );
}
