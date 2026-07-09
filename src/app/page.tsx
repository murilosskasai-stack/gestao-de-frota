import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { DEFAULT_MODULE, MODULE_PATH } from "@/lib/roles";

export default async function RootPage() {
  const { profile } = await requireUser();
  redirect(MODULE_PATH[DEFAULT_MODULE[profile.role]]);
}
