import { requireModule } from "@/lib/auth";
import { BackLink } from "@/components/shared/page-header";
import { ObraForm } from "@/components/obras/obra-form";

export default async function NovaObraPage() {
  await requireModule("obras");

  return (
    <div>
      <BackLink href="/obras" label="Obras" />
      <h1 className="mb-5 font-display text-[27px] font-extrabold tracking-[-0.3px]">Nova obra</h1>
      <ObraForm />
    </div>
  );
}
