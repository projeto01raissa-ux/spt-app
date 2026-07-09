"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NovoFuroForm({ obraId }: { obraId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [aberto, setAberto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [codigo, setCodigo] = useState("");

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase
      .from("furos")
      .insert({ obra_id: obraId, codigo, data_inicio: new Date().toISOString().slice(0, 10) })
      .select()
      .single();
    setLoading(false);
    if (!error && data) {
      router.push(`/campo/furos/${data.id}`);
    }
  }

  if (!aberto) {
    return (
      <button className="btn btn-primary" onClick={() => setAberto(true)}>
        + Novo furo
      </button>
    );
  }

  return (
    <form onSubmit={salvar} className="card row">
      <div className="field" style={{ marginBottom: 0, flex: 1 }}>
        <label>Código do furo</label>
        <input
          required
          placeholder="Ex: F-04"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
        />
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "Criando..." : "Criar e lançar dados"}
      </button>
      <button type="button" className="btn" onClick={() => setAberto(false)}>
        Cancelar
      </button>
    </form>
  );
}
