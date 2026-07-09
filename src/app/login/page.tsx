import { signIn } from "@/lib/actions/auth";
import { ROLE_LABELS } from "@/lib/roles";
import { initials } from "@/lib/roles";
import type { UserRole } from "@/lib/supabase/database.types";

const DEMO_ROLES: { role: UserRole; person: string; scope: string; email: string }[] = [
  { role: "diretor", person: "Ricardo Alves", scope: "Acesso total", email: "ricardo.alves@patio.demo" },
  { role: "gestor_frota", person: "Fernanda Dias", scope: "9 módulos", email: "fernanda.dias@patio.demo" },
  { role: "engenheiro", person: "Paulo Tavares", scope: "6 módulos", email: "paulo.tavares@patio.demo" },
  { role: "mecanico", person: "João Silva", scope: "4 módulos", email: "joao.silva@patio.demo" },
  { role: "encarregado", person: "Marcos Lima", scope: "3 módulos", email: "marcos.lima@patio.demo" },
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <div
      className="flex min-h-screen w-full flex-col overflow-y-auto font-sans text-[#16191d] md:h-screen md:flex-row md:overflow-hidden"
      style={{ background: "#f4f3f1" }}
    >
      {/* LEFT — brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink px-[50px] py-[54px] text-white md:flex md:flex-1">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "repeating-linear-gradient(135deg,transparent,transparent 22px,rgba(255,255,255,.018) 22px,rgba(255,255,255,.018) 44px)",
          }}
        />
        <div className="relative flex items-center gap-[13px]">
          <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[10px] bg-amber font-display text-2xl font-extrabold text-ink">
            P
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-[21px] font-extrabold tracking-[2px]">PÁTIO</span>
            <span className="mt-1 text-[11px] tracking-[1.5px] text-ink-muted">GESTÃO DE FROTA</span>
          </div>
        </div>
        <div className="relative">
          <h1 className="mb-[18px] font-display text-[38px] font-extrabold leading-[1.12] tracking-[-0.5px]">
            Toda a frota,
            <br />
            manutenção e logística
            <br />
            em um só lugar.
          </h1>
          <p className="max-w-[430px] text-[15px] leading-[1.6] text-ink-soft">
            Equipamentos, obras, chamados, preventivas e remanejamento — do canteiro à
            diretoria, sem WhatsApp e sem planilha solta.
          </p>
        </div>
        <div className="relative flex gap-[30px]">
          <div>
            <div className="font-display text-[26px] font-extrabold">48</div>
            <div className="mt-[3px] text-xs text-ink-muted">equipamentos</div>
          </div>
          <div>
            <div className="font-display text-[26px] font-extrabold">8</div>
            <div className="mt-[3px] text-xs text-ink-muted">obras ativas</div>
          </div>
          <div>
            <div className="font-display text-[26px] font-extrabold">71%</div>
            <div className="mt-[3px] text-xs text-ink-muted">utilização</div>
          </div>
        </div>
      </div>

      {/* RIGHT — login form */}
      <div className="flex w-full flex-col justify-center px-6 py-8 sm:px-[52px] sm:py-[54px] md:w-[480px] md:flex-none md:overflow-y-auto">
        <div className="mb-6 flex items-center gap-[11px] md:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber font-display text-lg font-extrabold text-ink">
            P
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-base font-extrabold tracking-[1.5px]">PÁTIO</span>
            <span className="mt-0.5 text-[9px] tracking-[1px] text-text-muted">GESTÃO DE FROTA</span>
          </div>
        </div>
        <h2 className="mb-[5px] font-display text-[25px] font-extrabold">Entrar</h2>
        <p className="mb-[26px] text-[13.5px] text-text-muted">
          Acesse com seu e-mail corporativo
        </p>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-fg/20 bg-red-bg px-3 py-2 text-[13px] font-medium text-red-fg">
            {error}
          </div>
        ) : null}

        <form action={signIn} className="mb-[22px] flex flex-col gap-[13px]">
          <input type="hidden" name="next" value={next ?? "/dashboard"} />
          <div>
            <div className="mb-[6px] text-[11.5px] font-semibold text-text-muted">E-MAIL</div>
            <input
              type="email"
              name="email"
              required
              placeholder="nome@empresa.com.br"
              className="w-full rounded-[10px] border border-input-border bg-white px-[14px] py-[13px] text-sm text-text outline-none placeholder:text-placeholder focus:border-ink"
            />
          </div>
          <div>
            <div className="mb-[6px] text-[11.5px] font-semibold text-text-muted">SENHA</div>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              className="w-full rounded-[10px] border border-input-border bg-white px-[14px] py-[13px] text-sm tracking-[3px] text-text outline-none placeholder:text-placeholder placeholder:tracking-[3px] focus:border-ink"
            />
          </div>
          <button
            type="submit"
            className="mt-1 cursor-pointer rounded-lg border-none bg-ink px-4 py-[13px] font-sans text-sm font-bold text-white"
          >
            Entrar
          </button>
        </form>

        <div className="mb-5 flex items-center gap-3">
          <span className="h-px flex-1" style={{ background: "#e3ddd2" }} />
          <span className="text-[11.5px] font-semibold text-[#9a958c]">
            ou entre demonstrando um perfil
          </span>
          <span className="h-px flex-1" style={{ background: "#e3ddd2" }} />
        </div>

        <div className="flex flex-col gap-[9px]">
          {DEMO_ROLES.map((r) => (
            <form action={signIn} key={r.role}>
              <input type="hidden" name="email" value={r.email} />
              <input type="hidden" name="password" value="demo12345" />
              <input type="hidden" name="next" value={next ?? "/dashboard"} />
              <button
                type="submit"
                className="group flex w-full cursor-pointer items-center gap-[13px] rounded-[11px] border border-[#e0dbd3] bg-white px-[14px] py-3 text-left font-sans hover:border-ink"
              >
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-[9px] bg-ink text-[13px] font-bold text-white">
                  {initials(r.person)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold">{ROLE_LABELS[r.role]}</span>
                  <span className="mt-[1px] block text-xs text-ink-muted">
                    {r.person} · {r.scope}
                  </span>
                </span>
                <span className="text-lg text-[#c4bdb2]">→</span>
              </button>
            </form>
          ))}
        </div>
      </div>
    </div>
  );
}
