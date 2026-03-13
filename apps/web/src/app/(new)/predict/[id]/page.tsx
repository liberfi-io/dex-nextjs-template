"use client";

import { useParams } from "next/navigation";
import { PredictDetailPage } from "../../../../components/page/PredictDetailPage";

export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <PredictDetailPage id={id} />;
}
