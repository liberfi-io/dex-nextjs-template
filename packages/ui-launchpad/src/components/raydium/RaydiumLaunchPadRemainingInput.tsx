import { useEffect, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { BigNumber } from "bignumber.js";
import { Input } from "@heroui/react";
import { formatCount3 } from "@liberfi/core";
import { useTranslation } from "@liberfi/ui-base";

export function RaydiumLaunchPadRemainingInput() {
  const { t } = useTranslation();

  const { control } = useFormContext();

  const sold = useWatch({ control, name: "sold" });

  const locked = useWatch({ control, name: "locked" });

  const supply = useWatch({ control, name: "supply" });

  const [remainingRatio, setRemainingRatio] = useState("");

  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    const remainingRatioBn = BigNumber.max(
      new BigNumber(100).minus(locked || 0).minus(sold || 0),
      0,
    );
    setRemainingRatio(remainingRatioBn.decimalPlaces(2).toString());
    setRemaining(
      supply && sold && remainingRatioBn.gt(0)
        ? formatCount3(new BigNumber(supply).times(remainingRatioBn).div(100))
        : "",
    );
  }, [sold, locked, supply]);

  return (
    <div className="w-full space-y-1.5">
      <h3>{t("extend.launchpad.remaining_label")}</h3>
      <Input
        type="number"
        value={remainingRatio}
        fullWidth
        disabled
        endContent={"%"}
        classNames={{
          inputWrapper:
            "bg-content2 data-[hover=true]:bg-content3 group-data-[focus=true]:bg-content3",
        }}
        aria-label={t("extend.launchpad.remaining_label")}
      />
      {remaining && <p className="p-1 text-primary text-xs">{remaining}</p>}
      <p className="p-1 text-neutral text-xs">{t("extend.launchpad.remaining_explained")}</p>
    </div>
  );
}
