"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function TopBar({ role }: { role: "campo" | "master" }) {
  const router = useRouter();
  const supabase = createClient();

  async function sair() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="topbar">
      <div className="topbar-inner">
        <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="brand">
            <div className="brand-mark">SP</div>
            <div>
              <div>SPT {role === "master" ? "Master" : "Campo"}</div>
            </div>
          </div>
        </Link>
        <button className="btn" onClick={sair}>
          Sair
        </button>
      </div>
    </div>
  );
}
