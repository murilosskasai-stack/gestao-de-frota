import Link from "next/link";
import { requireModule } from "@/lib/auth";

const BULLETS = [
  { title: "Toques mínimos", desc: "Equipamento e obra pré-selecionados pela alocação atual." },
  { title: "Funciona em qualquer tela", desc: "Formulários responsivos, sem instalar nada." },
  { title: "Cálculo automático", desc: "Horas trabalhadas e ociosas a partir do horímetro." },
  { title: "Alvos de toque grandes", desc: "Botões grandes para uso com luva, sob sol forte." },
];

export default async function CampoPage() {
  await requireModule("campo");

  return (
    <div>
      <div className="mb-[22px]">
        <h1 className="font-display text-[27px] font-extrabold tracking-[-0.3px]">App de Campo</h1>
        <p className="mt-1.5 text-[13.5px] text-text-muted">
          Mobile-first para encarregados e mecânicos — apontamento e abertura de chamados em segundos.
        </p>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/apontamento/novo"
          className="rounded-[16px] border border-card-border bg-white p-6 hover:border-ink"
        >
          <div className="mb-2 font-display text-lg font-extrabold">Lançar apontamento</div>
          <p className="mb-4 text-[13px] text-text-muted">
            Informe horímetro inicial e final — horas trabalhadas e ociosas são calculadas na hora.
          </p>
          <span className="inline-block rounded-[13px] bg-ink px-5 py-3 text-sm font-bold text-white">
            Apontamento de hoje →
          </span>
        </Link>

        <Link
          href="/chamados/novo"
          className="rounded-[16px] border border-card-border bg-white p-6 hover:border-ink"
        >
          <div className="mb-2 font-display text-lg font-extrabold">Abrir chamado</div>
          <p className="mb-4 text-[13px] text-text-muted">
            Descreva o problema e defina a prioridade — sem WhatsApp, com histórico completo.
          </p>
          <span className="inline-block rounded-[13px] bg-amber px-5 py-3 text-sm font-bold text-ink">
            Novo chamado →
          </span>
        </Link>
      </div>

      <div className="rounded-[13px] border border-card-border bg-white p-5">
        <div className="mb-[14px] text-sm font-bold">Pensado para o campo</div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {BULLETS.map((b) => (
            <div key={b.title}>
              <div className="text-[13.5px] font-semibold">{b.title}</div>
              <div className="mt-[3px] text-[12.5px] leading-relaxed text-text-muted-2">{b.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
