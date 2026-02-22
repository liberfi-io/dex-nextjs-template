"use client";

import { ChannelInfoPage } from "../../../components/ChannelsInfoPage";
import { useParams } from "next/navigation";

export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <ChannelInfoPage id={id} />;
}
