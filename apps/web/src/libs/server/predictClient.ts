import { createPredictClientV2 } from "@liberfi.io/ui-predict/client";

/**
 * Server-side PredictClientV2 factory.
 *
 * Uses `PREDICT_V2_URL` (the actual backend URL) directly, bypassing the
 * Next.js rewrite proxy that client-side code goes through via
 * `NEXT_PUBLIC_PREDICT_V2_URL`.
 */
export function getServerPredictV2Client() {
  return createPredictClientV2(process.env.PREDICT_V2_URL!);
}
