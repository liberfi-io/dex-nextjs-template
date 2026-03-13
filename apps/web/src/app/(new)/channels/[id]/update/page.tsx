"use client";

import { useParams, useSearchParams } from "next/navigation";
import { ChannelsUpdatePage } from "../../../../../components/page/ChannelsUpdatePage";

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");

  return <ChannelsUpdatePage id={id} type={type ?? "base"} />;
}
