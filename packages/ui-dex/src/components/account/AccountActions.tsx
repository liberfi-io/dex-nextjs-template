import clsx from "clsx";
import {
  // AddCashAction,
  // WithdrawAction,
  SendAction,
  ReceiveAction,
  ConvertAction,
  TradeAction,
  RedPacketAction,
} from "./actions";

export type AccountActionsProps = {
  className?: string;
};

export function AccountActions({ className }: AccountActionsProps) {
  return (
    <div className={clsx("w-full flex flex-wrap [&>*]:mt-5", className)}>
      {/* <AddCashAction />
      <WithdrawAction /> */}
      <SendAction />
      <ReceiveAction />
      <ConvertAction />
      <TradeAction />
      <RedPacketAction />
    </div>
  );
}
