import { z } from "zod";
import { CHAIN_ID } from "@liberfi/core";
import { getWrappedAddress, SOL_TOKEN_ADDRESS } from "@liberfi/ui-dex/dist/libs";

export const LaunchPadBasicFormSchema = z.object({
  name: z
    .string({
      required_error: "extend.launchpad.error_name_required",
    })
    .min(1, "extend.launchpad.error_name_required")
    .max(24, "extend.launchpad.error_name_length"),
  ticker: z
    .string({
      required_error: "extend.launchpad.error_ticker_required",
    })
    .min(1, "extend.launchpad.error_ticker_required")
    .max(10, "extend.launchpad.error_ticker_length"),
  image: z
    .string({
      required_error: "extend.launchpad.error_image_required",
    })
    .min(1, "extend.launchpad.error_image_required")
    .url("extend.launchpad.error_image_url"),
  description: z.string().optional(),
});

export type LaunchPadBasicFormValues = z.infer<typeof LaunchPadBasicFormSchema>;

export const LaunchPadSocialsFormSchema = z.object({
  website: z
    .string()
    .regex(
      /^((https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?)?$/,
      "extend.launchpad.error_website_invalid",
    )
    .transform((val) => (val === "" ? undefined : val))
    .optional(),
  twitter: z
    .string()
    .regex(/^([a-zA-Z0-9_]+)?$/, "extend.launchpad.error_twitter_invalid")
    .transform((val) => (val === "" ? undefined : val))
    .optional(),
  telegram: z
    .string()
    .regex(
      /^((?:https?:\/\/)?(?:t(?:elegram)?\.me|telegram\.org)\/([a-zA-Z0-9_]+))?$/,
      "extend.launchpad.error_telegram_invalid",
    )
    .transform((val) => (val === "" ? undefined : val))
    .optional(),
});

export type LaunchPadSocialsFormValues = z.infer<typeof LaunchPadSocialsFormSchema>;

export const PumpLaunchPadFormSchema = LaunchPadBasicFormSchema.and(LaunchPadSocialsFormSchema);

export type PumpLaunchPadFormValues = z.infer<typeof PumpLaunchPadFormSchema>;

export const defaultPumpLaunchPadFormValues: PumpLaunchPadFormValues = {
  name: "",
  ticker: "",
  image: "",
  description: "",
  website: "",
  twitter: "",
  telegram: "",
};

export const raydiumSupplyOptions = [1e8, 1e9, 1e10];

export const RaydiumLaunchPadAdvancedFormSchema = z
  .object({
    quoteMint: z
      .string({ required_error: "extend.launchpad.error_quote_mint_required" })
      .min(1, "extend.launchpad.error_quote_mint_required"),
    supply: z.number({ required_error: "extend.launchpad.error_supply_required" }),
    raised: z
      .number()
      .min(30, "extend.launchpad.error_raised_min")
      .or(z.nan())
      .refine((val) => !isNaN(val), "extend.launchpad.error_raised_required"),
    sold: z
      .number()
      .min(51, "extend.launchpad.error_sold_min")
      .max(80, "extend.launchpad.error_sold_max")
      .or(z.nan())
      .refine((val) => !isNaN(val), "extend.launchpad.error_sold_required"),
    locked: z
      .number()
      .min(0, "extend.launchpad.error_locked_min")
      .max(30, "extend.launchpad.error_locked_max")
      .or(z.nan()),
    shareFee: z.boolean().optional(),
    vestingDurationUnit: z.enum(["y", "m", "w", "d"]),
    vestingDuration: z
      .number()
      .min(1, "extend.launchpad.error_vesting_duration_min")
      .or(z.nan())
      .optional(),
    vestingCliffEnabled: z.boolean().optional(),
    vestingCliffUnit: z.enum(["y", "m", "w", "d"]),
    vestingCliff: z
      .number()
      .min(1, "extend.launchpad.error_vesting_cliff_min")
      .or(z.nan())
      .optional(),
  })
  .refine(
    // sold + locked <= 80
    (data) => {
      const { sold, locked } = data;
      return !locked || sold + locked <= 80;
    },
    { message: "extend.launchpad.error_locked_sum_by_sold", path: ["sold"] },
  )
  .refine(
    // vesting duration must be set if locked is set
    (data) => {
      const { vestingDuration, locked } = data;
      return !locked || !!vestingDuration;
    },
    { message: "extend.launchpad.error_vesting_duration_required", path: ["vestingDuration"] },
  )
  .refine(
    // vesting cliff must be set if vesting cliff is enabled
    (data) => {
      const { vestingCliff, vestingCliffEnabled, locked } = data;
      return !locked || !vestingCliffEnabled || !!vestingCliff;
    },
    { message: "extend.launchpad.error_vesting_cliff_required", path: ["vestingCliff"] },
  );

export type RaydiumLaunchPadAdvancedFormValues = z.infer<typeof RaydiumLaunchPadAdvancedFormSchema>;

export const RaydiumLaunchPadFormSchema = LaunchPadBasicFormSchema.and(
  LaunchPadSocialsFormSchema,
).and(RaydiumLaunchPadAdvancedFormSchema);

export type RaydiumLaunchPadFormValues = z.infer<typeof RaydiumLaunchPadFormSchema>;

export const defaultRaydiumLaunchPadFormValues: RaydiumLaunchPadFormValues = {
  name: "",
  ticker: "",
  image: "",
  description: "",
  website: "",
  twitter: "",
  telegram: "",
  quoteMint: getWrappedAddress(CHAIN_ID.SOLANA, SOL_TOKEN_ADDRESS) ?? SOL_TOKEN_ADDRESS,
  supply: 1e9,
  raised: 85,
  sold: 80,
  locked: NaN,
  shareFee: true,
  vestingDuration: 1,
  vestingDurationUnit: "m",
  vestingCliffEnabled: false,
  vestingCliffUnit: "m",
  vestingCliff: 1,
};
