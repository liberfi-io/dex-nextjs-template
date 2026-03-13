"use client";

import { useParams } from "next/navigation";
import { ChannelsInfoPage } from "../../../../components/page/ChannelsInfoPage";

export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <ChannelsInfoPage id={id} />;
}
