import { Key, useCallback, useState } from "react";
import { Button, Tab, Tabs } from "@heroui/react";
import {
  BackwardOutlinedIcon,
  useHideBottomNavigationBar,
  useHideHeader,
  useRouter,
  useTranslation,
} from "@liberfi/ui-base";
import { RandomRedPacketForm } from "../components/RandomRedPacketForm";
import { FixedRedPacketForm } from "../components/FixedRedPacketForm";

export function RedPacketCreatePage() {
  // hide header on tablet & mobile
  useHideHeader("tablet");

  // always hide bottom navigation bar
  useHideBottomNavigationBar();

  const { t } = useTranslation();

  const { navigate } = useRouter();

  const handleBack = useCallback(() => navigate(-1), [navigate]);

  const [type, setType] = useState<"random" | "fixed">("random");

  return (
    <div className="max-w-md max-lg:max-w-full max-lg:px-4 mx-auto flex flex-col">
      {/* header */}
      <div className="flex-none h-8 max-lg:h-[var(--header-height)] max-lg:pb-2 flex justify-between items-center">
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
          <h1 className="text-lg font-medium">{t("extend.redpacket.create.title")}</h1>
        </div>
      </div>

      {/* switch form type */}
      <div className="flex-none lg:mt-4 flex flex-col gap-2">
        <Tabs
          fullWidth
          selectedKey={type}
          onSelectionChange={setType as (key: Key) => void}
          classNames={{
            tabList: "bg-content1 rounded-lg",
            tabContent: "text-neutral group-data-[selected=true]:text-foreground",
            cursor: "dark:bg-content3 rounded-lg",
          }}
        >
          <Tab key="random" title={t("extend.redpacket.create.random.title")} />
          <Tab key="fixed" title={t("extend.redpacket.create.fixed.title")} />
        </Tabs>
        <p className="text-xs text-neutral">{t(`extend.redpacket.create.${type}.explained`)}</p>
      </div>

      {/* forms */}
      <div className="mt-6">
        {type === "random" ? <RandomRedPacketForm /> : <FixedRedPacketForm />}
      </div>
    </div>
  );
}
