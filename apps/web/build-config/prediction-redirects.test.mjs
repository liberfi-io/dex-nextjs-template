import assert from "node:assert/strict";
import test from "node:test";
import { PREDICTION_REDIRECTS } from "./prediction-redirects.mjs";

test("redirects prediction entry points outside the six-module navigation", () => {
  assert.deepEqual(PREDICTION_REDIRECTS, [
    {
      source: "/predict",
      destination: "/predict/sports",
      permanent: false,
    },
    {
      source: "/predict/matches",
      destination: "/predict/sports",
      permanent: false,
    },
  ]);
});
