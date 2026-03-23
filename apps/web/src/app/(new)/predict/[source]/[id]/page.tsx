"use client";

import { useParams } from "next/navigation";
import { PredictDetailPage } from "../../../../../components/page/PredictDetailPage";
import { toApiSource } from "../../../../../components/page/predict-source";

export default function Page() {
  const { source, id } = useParams<{ source: string; id: string }>();
  return <PredictDetailPage id={id} source={toApiSource(source)} />;
}
