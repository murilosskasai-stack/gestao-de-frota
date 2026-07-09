import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MODULE_PATH, PERM, type ModuleKey } from "@/lib/roles";
import type { Profile } from "@/lib/supabase/database.types";

export interface CurrentUser {
  id: string;
  email: string | null;
  profile: Profile;
}

// Fetch the authenticated user + profile, or redirect to /login.
// getUser() (not getSession()) so the identity is verified against the
// Supabase Auth server rather than trusted from an unverified cookie.
export async function requireUser(): Promise<CurrentUser> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  return { id: user.id, email: user.email ?? null, profile };
}

// Guard a module page: redirects to the user's first allowed module if
// their role doesn't have access to this one.
export async function requireModule(module: ModuleKey): Promise<CurrentUser> {
  const current = await requireUser();
  const allowed = PERM[current.profile.role] ?? [];
  if (!allowed.includes(module)) {
    redirect(MODULE_PATH[allowed[0] ?? "dashboard"]);
  }
  return current;
}
