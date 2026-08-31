import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ source: string; id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  redirect(`/predict/event/${id}`);
}
