import { Key, useCallback, useMemo, useState } from "react";
import { useAtomValue } from "jotai";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Form, Tab, Tabs } from "@heroui/react";
import { getPrimaryTokenSymbol } from "@liberfi/core";
import { chainAtom, useTranslation } from "@liberfi/ui-base";
import { BuySettingsSchema, BuySettingsValues, defaultBuySettingsValues } from "../../../types";
import { CustomBuyAmountsInput } from "./CustomBuyAmountsInput";
import { TradePresetForm } from "./TradePresetForm";
import { useSaveTradeBuySettings, useTradeBuySettings } from "../../../hooks";

export type BuySettingsFormProps = {
  onSettings?: (settings: BuySettingsValues) => void;
  preset?: number;
};

export function BuySettingsForm({ onSettings, preset: defaultPreset }: BuySettingsFormProps) {
  const { t } = useTranslation();

  const [preset, setPreset] = useState(defaultPreset === undefined ? "0" : `${defaultPreset}`);

  const chain = useAtomValue(chainAtom);

  const primaryTokenSymbol = useMemo(() => getPrimaryTokenSymbol(chain), [chain]);

  const settings = useTradeBuySettings(chain);

  const save = useSaveTradeBuySettings(chain);

  const formMethods = useForm<BuySettingsValues>({
    mode: "onBlur",
    reValidateMode: "onBlur",
    resolver: zodResolver(BuySettingsSchema),
    defaultValues: settings ?? defaultBuySettingsValues,
  });

  const { handleSubmit, control } = formMethods;

  const { fields } = useFieldArray({ control, name: "presets" });

  const onSubmit = useCallback(
    async (data: BuySettingsValues) => {
      try {
        save(data);
        onSettings?.(data);
      } catch (e) {
        console.error(e);
      }
    },
    [save, onSettings],
  );

  return (
    <FormProvider {...formMethods}>
      <Form className="space-y-12" onSubmit={handleSubmit(onSubmit)}>
        <div>
          {/* custom amounts */}
          <div className="space-y-2 mb-8">
            <h2 className="text-xs text-neutral">
              {t("extend.trade.settings.custom_buy_amount")} ({primaryTokenSymbol})
            </h2>
            <CustomBuyAmountsInput />
          </div>

          {/* presets */}
          <Tabs
            variant="bordered"
            size="sm"
            fullWidth
            classNames={{
              base: "mb-4",
              tabList: "border-content3",
              tab: "data-[selected=true]:bg-content3",
              tabContent: "text-neutral",
            }}
            selectedKey={preset}
            onSelectionChange={setPreset as (key: Key) => void}
            // TODO heroui bug: tab animation conflicts with modal animation
            disableAnimation
            aria-label="Presets"
          >
            {fields.map((_, index) => (
              <Tab key={`${index}`} title={t(`extend.trade.settings.preset${index + 1}`)}>
                <TradePresetForm preset={index} />
              </Tab>
            ))}
          </Tabs>
        </div>

        <Button
          fullWidth
          type="submit"
          className="disabled:opacity-100 disabled:bg-bullish-500"
          color="primary"
          disableRipple
        >
          {t("extend.common.save")}
        </Button>
      </Form>
    </FormProvider>
  );
}
