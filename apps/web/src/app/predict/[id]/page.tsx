"use client";

import { PredictDetailPage } from "../../../components/PredictDetailPage";
import { useParams } from "next/navigation";

export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <PredictDetailPage id={id} />;
}
