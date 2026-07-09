# SPT App

App para coleta de dados de sondagem SPT (Standard Penetration Test) em
campo, com relatório consolidado (dashboard + export Excel/PDF) para o
perfil Master.

**Stack:** Next.js 14 (App Router) · Supabase (Auth + Postgres + Storage) · Vercel

---

## 1. Passo a passo — Supabase

1. Crie um projeto novo em [supabase.com](https://supabase.com).
2. Vá em **SQL Editor → New query**, cole o conteúdo de `supabase/schema.sql` e clique **Run**.
   - Isso cria as tabelas (`profiles`, `obras`, `furos`, `leituras`, `fotos`), as
     políticas de segurança (RLS) e o bucket de Storage `fotos-campo`.
3. Vá em **Settings → API Keys** e copie:
   - **Project URL**
   - **anon / public key**
4. **Nunca** compartilhe ou use no app a `service_role key` nem o `JWT Secret`.
5. Depois que o primeiro usuário "master" se cadastrar pelo app (ele entra como
   `campo` por padrão), promova-o rodando no SQL Editor:
```sql
   update public.profiles set role = 'master' where id = 'UUID-DO-USUARIO';
```
   (o UUID aparece em **Authentication → Users**)

---

## 2. Passo a passo — Vercel

1. Em [vercel.com](https://vercel.com), clique **Add New → Project** e importe
   este repositório do GitHub.
2. Em **Environment Variables**, adicione:
   | Nome | Valor |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | a Project URL do Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | a anon key do Supabase |
   | `SUPABASE_SERVICE_ROLE_KEY` | a service_role key (só usada no servidor) |
3. Clique **Deploy**.

---

## 3. Como funciona o fluxo

- **Campo**: faz login/cadastro → cria/seleciona uma obra → cria um furo (F-01, F-02...)
  → vai lançando as leituras profundidade por profundidade (golpes das 3 camadas
  de 15cm, com NSPT calculado automaticamente) → tira fotos direto pelo celular
  → marca o furo como concluído.
- **Master**: faz login com perfil master → vê o dashboard com todas as obras →
  entra numa obra e vê o perfil de NSPT por profundidade de cada furo em gráfico
  → baixa o relatório em **Excel** (dados brutos) ou **PDF** (relatório formatado).
