import { createElement, type PropsWithChildren } from "react";
import { renderHook } from "@testing-library/react";
import { PinataProvider, uploadFileToIpfs, usePinata } from "./pinata";
import type { PinataSDK } from "pinata";

function fakePinata(cid = "bafytest") {
  const url = jest.fn().mockResolvedValue({ cid });
  const file = jest.fn().mockReturnValue({ url });
  return {
    upload: { public: { file } },
    url,
    file,
  };
}

describe("uploadFileToIpfs", () => {
  it("uploads through a SDK presigned URL and returns the ipfs gateway path", async () => {
    const pinata = fakePinata();
    const getPresignedUploadUrl = jest
      .fn()
      .mockResolvedValue("https://signed.example/upload");
    const file = new File(["hi"], "hi.png", { type: "image/png" });

    const result = await uploadFileToIpfs({
      file,
      getPresignedUploadUrl,
      pinata,
    });

    expect(getPresignedUploadUrl).toHaveBeenCalledTimes(1);
    expect(pinata.file).toHaveBeenCalledWith(file);
    expect(pinata.url).toHaveBeenCalledWith("https://signed.example/upload");
    expect(result).toBe("https://ipfs.io/ipfs/bafytest");
  });
});

describe("usePinata", () => {
  it("throws outside PinataProvider", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => renderHook(() => usePinata())).toThrow(
      /must be used within a PinataProvider/,
    );
    spy.mockRestore();
  });

  it("returns the provided Pinata client", () => {
    const client = fakePinata() as unknown as PinataSDK;
    const wrapper = ({ children }: PropsWithChildren) =>
      createElement(PinataProvider, { client }, children);
    const { result } = renderHook(() => usePinata(), { wrapper });
    expect(result.current).toBe(client);
  });
});
