"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"entrar" | "cadastrar">("entrar");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setLoading(true);

    if (mode === "entrar") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });
      if (error) {
        setErro("E-mail ou senha inválidos.");
        setLoading(false);
        return;
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: { data: { nome } },
      });
      if (error) {
        setErro(error.message);
        setLoading(false);
        return;
      }
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="page" style={{ alignItems: "center", justifyContent: "center" }}>
      <div className="card" style={{ width: 380, maxWidth: "90vw" }}>
        <div className="brand" style={{ marginBottom: 20 }}>
          <div className="brand-mark">SP</div>
          <div>
            <div>SPT Campo</div>
            <div className="text-dim" style={{ fontSize: 12, fontWeight: 400 }}>
              Sondagem a percussão
            </div>
          </div>
        </div>

        <div className="row" style={{ marginBottom: 18 }}>
          <button
            type="button"
            className="btn"
            style={{
              flex: 1,
              justifyContent: "center",
              borderColor: mode === "entrar" ? "var(--accent)" : "var(--border)",
            }}
            onClick={() => setMode("entrar")}
          >
            Entrar
          </button>
          <button
            type="button"
            className="btn"
            style={{
              flex: 1,
              justifyContent: "center",
              borderColor: mode === "cadastrar" ? "var(--accent)" : "var(--border)",
            }}
            onClick={() => setMode("cadastrar")}
          >
            Cadastrar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="stack">
          {mode === "cadastrar" && (
            <div className="field">
              <label>Nome</label>
              <input value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>
          )}
          <div className="field">
            <label>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {erro && (
            <div style={{ color: "var(--danger)", fontSize: 13 }}>{erro}</div>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Aguarde..." : mode === "entrar" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <p className="text-dim" style={{ fontSize: 12, marginTop: 16 }}>
          Novas contas entram como perfil "Campo". O perfil "Master" é definido
          manualmente no banco.
        </p>
      </div>
    </div>
  );
}
