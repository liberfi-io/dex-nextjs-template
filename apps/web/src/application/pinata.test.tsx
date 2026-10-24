import { createLazyPinataUploadClient, uploadFileToIpfs } from "./pinata";

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
    const getPresignedUploadUrl = jest.fn().mockResolvedValue("https://signed.example/upload");
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

describe("createLazyPinataUploadClient", () => {
  it("does not load Pinata until the first upload needs it", async () => {
    const client = fakePinata();
    const load = jest.fn().mockResolvedValue(client);
    const getClient = createLazyPinataUploadClient(load);

    expect(load).not.toHaveBeenCalled();
    await expect(getClient()).resolves.toBe(client);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("shares one in-flight client load across concurrent uploads", async () => {
    const client = fakePinata();
    const load = jest.fn().mockResolvedValue(client);
    const getClient = createLazyPinataUploadClient(load);

    const [first, second] = await Promise.all([getClient(), getClient()]);

    expect(first).toBe(client);
    expect(second).toBe(client);
    expect(load).toHaveBeenCalledTimes(1);
  });
});
