"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NovaObraForm() {
  const router = useRouter();
  const supabase = createClient();
  const [aberto, setAberto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome_obra: "",
    cliente: "",
    rodovia_km: "",
    numero_relatorio: "",
    art: "",
  });

  function update(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await supabase.from("obras").insert(form);
    setLoading(false);
    setAberto(false);
    router.refresh();
  }

  if (!aberto) {
    return (
      <button className="btn btn-primary" onClick={() => setAberto(true)}>
        + Nova obra
      </button>
    );
  }

  return (
    <form onSubmit={salvar} className="card">
      <h3 style={{ marginBottom: 14, fontSize: 16 }}>Nova obra</h3>
      <div className="field">
        <label>Nome da obra</label>
        <input
          required
          placeholder="Ex: Obras de Galpões"
          value={form.nome_obra}
          onChange={(e) => update("nome_obra", e.target.value)}
        />
      </div>
      <div className="field-row">
        <div className="field">
          <label>Cliente</label>
          <input value={form.cliente} onChange={(e) => update("cliente", e.target.value)} />
        </div>
        <div className="field">
          <label>Rodovia / KM / Endereço</label>
          <input
            value={form.rodovia_km}
            onChange={(e) => update("rodovia_km", e.target.value)}
          />
        </div>
      </div>
      <div className="field-row">
        <div className="field">
          <label>Nº do relatório</label>
          <input
            value={form.numero_relatorio}
            onChange={(e) => update("numero_relatorio", e.target.value)}
          />
        </div>
        <div className="field">
          <label>ART</label>
          <input value={form.art} onChange={(e) => update("art", e.target.value)} />
        </div>
      </div>
      <div className="row" style={{ marginTop: 6 }}>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Salvando..." : "Salvar obra"}
        </button>
        <button type="button" className="btn" onClick={() => setAberto(false)}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
