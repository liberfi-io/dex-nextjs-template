import { Controller, useFormContext } from "react-hook-form";
import clsx from "clsx";
import { Avatar, Select, SelectItem } from "@heroui/react";
import { CHAIN_ID, getPrimaryTokenAvatar } from "@liberfi/core";
import { useTranslation } from "@liberfi/ui-base";
import {
  formatShortAddress,
  getWrappedAddress,
  SOL_TOKEN_ADDRESS,
  SOL_TOKEN_SYMBOL,
} from "@liberfi/ui-dex/libs";

const options = [
  {
    name: SOL_TOKEN_SYMBOL,
    address: getWrappedAddress(CHAIN_ID.SOLANA, SOL_TOKEN_ADDRESS),
    image: getPrimaryTokenAvatar(CHAIN_ID.SOLANA),
  },
];

export function RaydiumLaunchPadQuoteMintSelect() {
  const { t } = useTranslation();

  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name="quoteMint"
      render={({
        field: { name, onChange, value, onBlur, ref, disabled },
        fieldState: { invalid, error },
      }) => (
        <div className="w-full space-y-1.5">
          <h3 className={clsx({ "text-danger": invalid })}>{t("extend.launchpad.quote_mint_label")}</h3>
          <Select
            items={options}
            ref={ref}
            placeholder={t("extend.launchpad.quote_mint_placeholder")}
            name={name}
            defaultSelectedKeys={[value]}
            selectedKeys={[value]}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            isInvalid={invalid}
            errorMessage={error?.message ? t(error.message) : undefined}
            fullWidth
            disallowEmptySelection
            classNames={{
              trigger: [
                "h-10",
                !invalid && "bg-content2",
                !invalid && "data-[hover=true]:bg-content3",
                !invalid && "data-[focus=true]:bg-content3",
                !invalid && "data-[open=true]:bg-content3",
              ],
              selectorIcon: "text-neutral",
            }}
            popoverProps={{
              classNames: {
                content: "p-0 bg-content3 rounded-lg",
              },
            }}
            listboxProps={{
              itemClasses: {
                base: [
                  "rounded-lg text-neutral bg-content3",
                  "data-[hover=true]:bg-content3 data-[hover=true]:text-neutral",
                  "dark:data-[hover=true]:bg-content3 dark:data-[hover=true]:text-neutral",
                  "data-[selectable=true]:focus:bg-content3 data-[selectable=true]:focus:text-neutral",
                  "data-[focus-visible=true]:ring-border",
                ],
              },
            }}
            renderValue={(items) => {
              return items.map((item) => (
                <div key={item.key} className="flex items-center gap-2">
                  <Avatar
                    alt={item.data?.name ?? ""}
                    className="shrink-0 w-5 h-5"
                    src={item.data?.image}
                  />
                  <span className="text-foreground text-sm font-medium">{item.data?.name}</span>
                  <span className="text-neutral text-xs">
                    ({formatShortAddress(item.data?.address ?? "")})
                  </span>
                </div>
              ));
            }}
            aria-label={t("extend.launchpad.quote_mint_label")}
          >
            {(option) => (
              <SelectItem key={option.address} textValue={option.name}>
                <div className="flex gap-2 items-center">
                  <Avatar alt={option.name} className="shrink-0 w-5 h-5" src={option.image} />
                  <span className="text-foreground text-sm font-medium">{option.name}</span>
                  <span className="text-neutral text-xs">
                    ({formatShortAddress(option.address ?? "")})
                  </span>
                </div>
              </SelectItem>
            )}
          </Select>
        </div>
      )}
    />
  );
}
