import { Key, useCallback, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Form, Tab, Tabs } from "@heroui/react";
import { chainAtom, useTranslation } from "@liberfi/ui-base";
import { defaultSellSettingsValues, SellSettingsSchema, SellSettingsValues } from "../../../types";
import { TradePresetForm } from "./TradePresetForm";
import { CustomSellPercentagesInput } from "./CustomSellPercentagesInput";
import { useSaveTradeSellSettings, useTradeSellSettings } from "../../../hooks";
import { useAtomValue } from "jotai";

export type SellSettingsFormProps = {
  onSettings?: (settings: SellSettingsValues) => void;
  preset?: number;
};

export function SellSettingsForm({ onSettings, preset: defaultPreset }: SellSettingsFormProps) {
  const { t } = useTranslation();

  const [preset, setPreset] = useState(defaultPreset === undefined ? "0" : `${defaultPreset}`);

  const chain = useAtomValue(chainAtom);

  const settings = useTradeSellSettings(chain);

  const save = useSaveTradeSellSettings(chain);

  const formMethods = useForm<SellSettingsValues>({
    mode: "onBlur",
    reValidateMode: "onBlur",
    resolver: zodResolver(SellSettingsSchema),
    defaultValues: settings ?? defaultSellSettingsValues,
  });

  const { handleSubmit, control } = formMethods;

  const { fields } = useFieldArray({ control, name: "presets" });

  const onSubmit = useCallback(
    async (data: SellSettingsValues) => {
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
            <h2 className="text-xs text-neutral">{t("extend.trade.settings.custom_sell_amount")} (%)</h2>
            <CustomSellPercentagesInput />
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
