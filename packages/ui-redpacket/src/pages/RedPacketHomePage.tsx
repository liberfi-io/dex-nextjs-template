import { useCallback, useState } from "react";
import { Button } from "@heroui/react";
import { ROUTES } from "@liberfi/core";
import {
  BackwardOutlinedIcon,
  RecordsOutlinedIcon,
  useAppSdk,
  useAuthenticatedCallback,
  useHideBottomNavigationBar,
  useHideHeader,
  useRouter,
  useTranslation,
} from "@liberfi/ui-base";
import { MultipleRedPacketsIcon } from "../icons";
import { RedPacketCodeInput } from "../components/RedPacketCodeInput";
import { fetchRedPacket } from "@liberfi/react-redpacket";
import { useDexClient } from "@liberfi/react-dex";
import { getRedPacketStatus } from "../utils";
import toast from "react-hot-toast";

export function RedPacketHomePage() {
  // hide header on tablet & mobile
  useHideHeader("tablet");

  // always hide bottom navigation bar
  useHideBottomNavigationBar();

  const appSdk = useAppSdk();

  const dexClient = useDexClient();

  const { t } = useTranslation();

  const { navigate } = useRouter();

  const handleBack = useCallback(() => navigate(-1), [navigate]);

  const handleHistories = useAuthenticatedCallback(() => {
    navigate(ROUTES.redPacket.histories());
  }, [navigate]);

  const handleCreate = useCallback(() => navigate(ROUTES.redPacket.create()), [navigate]);

  const [shareCode, setShareCode] = useState("");

  const handleClaimInputChange = useCallback((value: string) => {
    setShareCode(value);
  }, []);

  const [isClaiming, setIsClaiming] = useState(false);

  const handleClaim = useAuthenticatedCallback(async () => {
    setIsClaiming(true);
    try {
      const redPacket = await fetchRedPacket(dexClient, shareCode);
      const status = getRedPacketStatus(redPacket);
      if (status !== "ongoing") {
        toast.error(t("extend.redpacket.claim.error_red_packet_not_ongoing"));
        return;
      }
      appSdk.events.emit("redpacket:claim", { redPacket });
    } catch (e) {
      console.error("claim red packet error", e);
      if (e instanceof Error && "response" in e && e.response instanceof Response) {
        try {
          const bodyText = await e.response.text();
          const { message, details } = JSON.parse(bodyText ?? "{}") as {
            message?: string;
            details?: string;
          };
          toast.error(details ?? message ?? t("extend.redpacket.claim.error_fetch_red_packet"));
        } catch (e1) {
          console.error("claim red packet error", e1);
          toast.error(t("extend.redpacket.claim.error_fetch_red_packet"));
        }
      } else {
        toast.error(t("extend.redpacket.claim.error_fetch_red_packet"));
      }
    } finally {
      setIsClaiming(false);
    }
  }, [appSdk.events, dexClient, shareCode]);

  return (
    <div className="max-w-md max-lg:max-w-full max-lg:px-4 mx-auto flex flex-col">
      {/* header */}
      <div className="h-8 max-lg:h-[var(--header-height)] max-lg:pb-2 flex justify-between items-center">
        {/* title */}
        <div className="flex items-center">
          {/* go back */}
          <Button
            isIconOnly
            className="w-8 min-w-0 h-8 min-h-0 rounded bg-transparent lg:hidden"
            onPress={handleBack}
            disableRipple
          >
            <BackwardOutlinedIcon />
          </Button>
          {/* title */}
          <h1 className="text-lg font-medium">{t("extend.redpacket.home.title")}</h1>
        </div>

        {/* jump to histories */}
        <Button
          isIconOnly
          className="w-8 min-w-0 h-8 min-h-0 rounded bg-content2"
          onPress={handleHistories}
          disableRipple
        >
          <RecordsOutlinedIcon />
        </Button>
      </div>

      {/* create */}
      <div className="lg:mt-4 flex flex-col gap-4">
        {/* splash */}
        <div className="p-4 rounded-lg bg-content2">
          <h2 className="text-sm text-neutral">{t("extend.redpacket.home.create_title")}</h2>
          <div className="flex items-center justify-center py-6">
            <MultipleRedPacketsIcon />
          </div>
        </div>
        {/* create button  */}
        <Button
          fullWidth
          color="primary"
          className="rounded-lg"
          disableRipple
          onPress={handleCreate}
        >
          {t("extend.redpacket.home.create")}
        </Button>
      </div>

      {/* claim */}
      <div className="mt-10 flex flex-col gap-4">
        {/* claim title */}
        <h2 className="text-xs text-neutral">{t("extend.redpacket.home.claim_title")}</h2>
        {/* claim input */}
        <RedPacketCodeInput onChange={handleClaimInputChange} />
        {/* claim button */}
        <Button
          fullWidth
          color="secondary"
          className="rounded-lg"
          disableRipple
          onPress={handleClaim}
          isDisabled={!shareCode}
          isLoading={isClaiming}
        >
          {t("extend.redpacket.home.claim")}
        </Button>
        {/* refund warning */}
        <p className="text-xs text-neutral">{t("extend.redpacket.home.refund_warning")}</p>
      </div>
    </div>
  );
}
