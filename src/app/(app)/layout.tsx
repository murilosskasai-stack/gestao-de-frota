import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireUser();
  const supabase = await createClient();

  const [{ count: abertos }, { count: preventivasPendentes }, { count: solicitacoesPendentes }] =
    await Promise.all([
      supabase
        .from("chamados")
        .select("*", { count: "exact", head: true })
        .in("status", ["aberto", "em_analise", "equipe_deslocada"]),
      supabase
        .from("v_preventivas_pendentes")
        .select("*", { count: "exact", head: true })
        .gt("horimetro_ultima_execucao", 0)
        .lt("horas_restantes", 100),
      supabase
        .from("solicitacoes")
        .select("*", { count: "exact", head: true })
        .in("status", ["pendente", "em_analise"]),
    ]);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-app-bg font-sans text-text">
      <Topbar userName={profile.full_name} role={profile.role} alertCount={abertos ?? 0} />
      <MobileNav
        role={profile.role}
        badges={{
          chamados: abertos ?? undefined,
          preventiva: preventivasPendentes ?? undefined,
          logistica: solicitacoesPendentes ?? undefined,
        }}
      />
      <div className="flex min-h-0 flex-1">
        <Sidebar
          role={profile.role}
          badges={{
            chamados: abertos ?? undefined,
            preventiva: preventivasPendentes ?? undefined,
            logistica: solicitacoesPendentes ?? undefined,
          }}
        />
        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1280px] px-4 py-5 pb-[60px] sm:px-[30px] sm:py-[26px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
