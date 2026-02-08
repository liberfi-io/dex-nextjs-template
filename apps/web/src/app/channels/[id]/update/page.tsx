"use client";

import { ChannelsUpdatePage } from "@/components/ChannelsUpdatePage";
import { useParams, useSearchParams } from "next/navigation";

export default function Page() {
  const { id } = useParams<{ id: string }>();

  const searchParams = useSearchParams();

  const type = searchParams.get("type");

  return <ChannelsUpdatePage id={id} type={type ?? "base"} />;
}
