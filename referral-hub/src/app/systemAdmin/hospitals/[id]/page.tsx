import { HospitalDetail } from "@/components/system-admin";

export default async function HospitalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <HospitalDetail hospitalId={id} />;
}
