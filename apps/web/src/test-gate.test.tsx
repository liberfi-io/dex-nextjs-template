import { render, screen } from "@testing-library/react";
import { InstantBuyProvider, useInstantBuy } from "./components/home/InstantBuyContext";
import { predictEventHref } from "./components/page/predict-source";

function InstantBuyConsumer() {
  const { amount, preset } = useInstantBuy();

  return <output data-testid="instant-buy">{`${amount}:${preset}`}</output>;
}

describe("application test gate", () => {
  it("renders a provider-backed consumer in jsdom", () => {
    render(
      <InstantBuyProvider amount={25} preset={10}>
        <InstantBuyConsumer />
      </InstantBuyProvider>,
    );

    expect(screen.getByTestId("instant-buy").textContent).toBe("25:10");
  });

  it("verifies a route-facing adapter contract", () => {
    expect(
      predictEventHref({
        slug: "fed-rate-decision",
        source: "polymarket",
      }),
    ).toBe("/predict/polymarket/fed-rate-decision");
  });
});
