import { requireModule } from "@/lib/auth";

const PIPELINE = [
  { t: "Coleta", d: "Chamados, horímetros, OS, apontamentos" },
  { t: "Camada de eventos", d: "Fila + feature store no Supabase" },
  { t: "Modelos", d: "Classificação · ranking · previsão" },
  { t: "Ação no produto", d: "Sugestões, alertas e auto-OS" },
];

const FEATURES: { title: string; desc: string; badge: string }[] = [
  {
    title: "Classificação automática",
    desc: "Categoriza o chamado (motor, hidráulico, elétrico…) a partir da descrição e fotos enviadas pelo operador.",
    badge: "Estrutura pronta",
  },
  {
    title: "Sugestão de prioridade",
    desc: "Modelo pondera tipo de falha, criticidade do equipamento e impacto na obra para sugerir Alta / Média / Baixa.",
    badge: "Planejado",
  },
  {
    title: "Diagnóstico preliminar",
    desc: "LLM cruza sintomas com histórico de manutenção e manuais para sugerir causas prováveis ao mecânico.",
    badge: "Planejado",
  },
  {
    title: "Previsão de falhas",
    desc: "Séries de horímetro + histórico de OS estimam a probabilidade de falha antes da quebra.",
    badge: "Pesquisa",
  },
];

const BADGE_STYLE: Record<string, string> = {
  "Estrutura pronta": "bg-green-bg text-green-fg",
  Planejado: "bg-amber-bg text-amber-fg",
  Pesquisa: "bg-blue-bg text-blue-fg",
};

export default async function IaPage() {
  await requireModule("ia");

  return (
    <div>
      <div className="mb-[22px]">
        <h1 className="font-display text-[27px] font-extrabold tracking-[-0.3px]">IA & Automação</h1>
        <p className="mt-1.5 text-[13.5px] text-text-muted">
          Arquitetura preparada para inteligência aplicada — evolução incremental sobre os dados já
          capturados no sistema. A ociosidade e o remanejamento sugerido no módulo de Logística já
          funcionam com regras determinísticas hoje; os itens abaixo evoluem essa base para modelos.
        </p>
      </div>

      <div className="mb-4 rounded-[13px] bg-ink p-[22px] text-white">
        <div className="mb-[18px] text-[13px] font-bold uppercase tracking-[1px] text-ink-muted">
          Pipeline de dados → ação
        </div>
        <div className="flex flex-wrap items-stretch gap-0">
          {PIPELINE.map((p, i) => (
            <div key={p.t} className="flex flex-1 items-center gap-0">
              <div className="flex-1 rounded-[11px] border border-ink-border bg-ink-3 p-[15px]">
                <div className="mb-1.5 font-display text-[15px] font-bold">{p.t}</div>
                <div className="text-xs leading-snug text-ink-muted-2">{p.d}</div>
              </div>
              {i < PIPELINE.length - 1 ? (
                <span className="flex-none px-2.5 text-xl text-amber">→</span>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-[13px] border border-card-border bg-white p-5">
            <div className="mb-[9px] flex items-center justify-between">
              <div className="text-[15px] font-bold">{f.title}</div>
              <span className={`rounded-md px-[9px] py-[3px] text-[10.5px] font-bold ${BADGE_STYLE[f.badge]}`}>
                {f.badge}
              </span>
            </div>
            <div className="text-[13px] leading-relaxed text-text-muted">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
