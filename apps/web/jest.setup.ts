import "@testing-library/jest-dom";
import { TextDecoder, TextEncoder } from "node:util";

if (typeof globalThis.TextEncoder === "undefined") {
  Object.assign(globalThis, { TextEncoder });
}

if (typeof globalThis.TextDecoder === "undefined") {
  Object.assign(globalThis, { TextDecoder });
}
