declare module "@paulmillr/qr" {
  type QrEcc = "low" | "medium" | "quartile" | "high";
  interface QrOpts {
    ecc?: QrEcc;
    scale?: number;
  }
  function encodeQR(text: string, output: "svg" | "ascii" | "term", opts?: QrOpts): string;
  function encodeQR(text: string, output: "gif", opts?: QrOpts): Uint8Array;
  function encodeQR(text: string, output: "raw", opts?: QrOpts): boolean[][];
  export default encodeQR;
}
