import type { UserRole } from "@/lib/supabase/database.types";

export const ROLE_LABELS: Record<UserRole, string> = {
  diretor: "Diretor",
  gestor_frota: "Gestor de Frota",
  engenheiro: "Engenheiro",
  mecanico: "Mecânico",
  encarregado: "Encarregado",
};

export type ModuleKey =
  | "dashboard"
  | "obras"
  | "equip"
  | "apont"
  | "chamados"
  | "preventiva"
  | "ociosidade"
  | "logistica"
  | "ia"
  | "campo";

export const MODULE_PATH: Record<ModuleKey, string> = {
  dashboard: "/dashboard",
  obras: "/obras",
  equip: "/equipamentos",
  apont: "/apontamento",
  chamados: "/chamados",
  preventiva: "/preventiva",
  ociosidade: "/ociosidade",
  logistica: "/logistica",
  ia: "/ia",
  campo: "/campo",
};

export const PERM: Record<UserRole, ModuleKey[]> = {
  diretor: [
    "dashboard",
    "obras",
    "equip",
    "apont",
    "chamados",
    "preventiva",
    "ociosidade",
    "logistica",
    "ia",
    "campo",
  ],
  gestor_frota: [
    "dashboard",
    "obras",
    "equip",
    "apont",
    "chamados",
    "preventiva",
    "ociosidade",
    "logistica",
    "campo",
  ],
  engenheiro: ["dashboard", "obras", "equip", "apont", "ociosidade", "logistica"],
  mecanico: ["equip", "chamados", "preventiva", "campo"],
  encarregado: ["apont", "chamados", "campo"],
};

// Landing module right after login, per role.
export const DEFAULT_MODULE: Record<UserRole, ModuleKey> = {
  diretor: "dashboard",
  gestor_frota: "dashboard",
  engenheiro: "dashboard",
  mecanico: "chamados",
  encarregado: "apont",
};

export interface NavGroup {
  label: string;
  items: { key: ModuleKey; label: string }[];
}

export const NAV_DEF: NavGroup[] = [
  { label: "Geral", items: [{ key: "dashboard", label: "Dashboard Executivo" }] },
  {
    label: "Operação",
    items: [
      { key: "obras", label: "Obras" },
      { key: "equip", label: "Equipamentos" },
      { key: "apont", label: "Apontamento Diário" },
    ],
  },
  {
    label: "Manutenção",
    items: [
      { key: "chamados", label: "Chamados" },
      { key: "preventiva", label: "Preventiva" },
    ],
  },
  {
    label: "Logística",
    items: [
      { key: "ociosidade", label: "Ociosidade" },
      { key: "logistica", label: "Solicitações & Remanejamento" },
    ],
  },
  {
    label: "Sistema",
    items: [
      { key: "ia", label: "IA & Automação" },
      { key: "campo", label: "App de Campo" },
    ],
  },
];

export function navForRole(role: UserRole): NavGroup[] {
  const allowed = new Set(PERM[role] ?? []);
  return NAV_DEF.map((group) => ({
    ...group,
    items: group.items.filter((item) => allowed.has(item.key)),
  })).filter((group) => group.items.length > 0);
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
