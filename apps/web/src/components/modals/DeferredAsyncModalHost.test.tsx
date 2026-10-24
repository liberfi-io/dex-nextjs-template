import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AsyncModal, ModalCoordinatorProvider } from "@liberfi.io/ui-scaffold";
import {
  DeferredAsyncModalHost,
  useDeferredAsyncModal,
} from "./DeferredAsyncModalHost";

const MODAL_ID = "deferred-test";

function TestModal() {
  return (
    <AsyncModal id={MODAL_ID}>
      {({ isOpen, onClose }) =>
        isOpen ? <button data-testid="loaded-modal" onClick={onClose} /> : null
      }
    </AsyncModal>
  );
}

describe("DeferredAsyncModalHost", () => {
  it("loads and registers modal content only on first open", async () => {
    const loader = jest.fn(async () => TestModal);

    function Trigger() {
      const { onOpen } = useDeferredAsyncModal(MODAL_ID, loader);
      return <button data-testid="open-modal" onClick={() => void onOpen()} />;
    }

    render(
      <ModalCoordinatorProvider>
        <DeferredAsyncModalHost>
          <Trigger />
        </DeferredAsyncModalHost>
      </ModalCoordinatorProvider>,
    );

    expect(loader).not.toHaveBeenCalled();
    fireEvent.click(screen.getByTestId("open-modal"));

    expect(await screen.findByTestId("loaded-modal")).not.toBeNull();
    expect(loader).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId("loaded-modal"));
    await waitFor(() =>
      expect(screen.queryByTestId("loaded-modal")).toBeNull(),
    );
    fireEvent.click(screen.getByTestId("open-modal"));
    expect(await screen.findByTestId("loaded-modal")).not.toBeNull();
    expect(loader).toHaveBeenCalledTimes(1);
  });
});
