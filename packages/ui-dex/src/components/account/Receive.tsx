import { useAuth, useTranslation } from "@liberfi/ui-base";
import { QRCode } from "react-qrcode-logo";
import { useMemo } from "react";
import { CHAIN_ID, chainSlugs } from "@liberfi/core";
import { capitalize } from "lodash-es";
import { Button } from "@heroui/react";
import { CopyIcon } from "../../assets";
import clsx from "clsx";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";

export function Receive() {
  const { t } = useTranslation();

  const copy = useCopyToClipboard();

  const { user } = useAuth();

  const [warning1, warning2] = useMemo(() => t("extend.account.receive_warning").split("Solana"), [t]);

  return (
    <div className="space-y-4 pb-4 lg:pb-8">
      {/* QR code */}
      <div className="w-[240px] h-[240px] mx-auto flex justify-around items-center bg-white rounded-lg">
        <QRCode
          size={200}
          value={user?.solanaAddress ?? ""}
          bgColor="transparent"
          qrStyle="dots"
          eyeRadius={{
            inner: 2,
            outer: 16,
          }}
        />
      </div>

      {/* Warning */}
      <p className="text-center text-sm text-neutral">
        {warning1}
        <span className="font-semibold text-foreground">
          {capitalize(chainSlugs[CHAIN_ID.SOLANA])}
        </span>
        {warning2}
      </p>

      {/* Copy address */}
      <div className="w-full space-y-4">
        <div className="pl-4 pr-2 py-2 border border-content3 rounded-lg flex justify-between items-center gap-2">
          <p className="flex-1 text-neutral text-xs text-wrap break-all">
            {user?.solanaAddress ?? ""}
          </p>
          <div className="flex-0">
            <Button
              isIconOnly
              className={clsx(
                "flex w-8 min-w-0 h-8 min-h-0 text-neutral bg-transparent",
                "data-[focus-visible=true]:outline-0",
              )}
              disableRipple
              onPress={() => copy(user?.solanaAddress ?? "")}
            >
              <CopyIcon width={16} height={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
