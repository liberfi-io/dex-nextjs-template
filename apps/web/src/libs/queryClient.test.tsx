import type { PropsWithChildren } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { queryClient } from "./queryClient";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

function QueryWrapper({ children }: PropsWithChildren) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe("queryClient identity isolation", () => {
  beforeEach(() => {
    queryClient.clear();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it("does not expose the previous chain's wallet data while the new chain loads", async () => {
    let chain = "sol";
    const ethResult = deferred<{ balance: string }>();

    const { result, rerender } = renderHook(
      () =>
        useQuery({
          queryKey: ["wallet-balance", chain],
          queryFn: () =>
            chain === "sol" ? Promise.resolve({ balance: "1.832 SOL" }) : ethResult.promise,
        }),
      { wrapper: QueryWrapper },
    );

    await waitFor(() => expect(result.current.data?.balance).toBe("1.832 SOL"));

    chain = "eth";
    rerender();

    expect(result.current.data).toBeUndefined();

    ethResult.resolve({ balance: "0.25 ETH" });
    await waitFor(() => expect(result.current.data?.balance).toBe("0.25 ETH"));
  });
});
