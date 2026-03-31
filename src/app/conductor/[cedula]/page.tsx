import { redirect } from "next/navigation";

export default async function ConductorRedirect({
  params,
}: {
  params: Promise<{ cedula: string }>;
}) {
  const { cedula } = await params;
  redirect(`/dashboard/conductores/${cedula}`);
}
