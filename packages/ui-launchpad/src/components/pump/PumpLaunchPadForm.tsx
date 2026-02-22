import { Key, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { BigNumber } from "bignumber.js";
import { useSetAtom } from "jotai";
import clsx from "clsx";
import { zodResolver } from "@hookform/resolvers/zod";
import { CHAIN_ID } from "@liberfi/core";
import { Badge, Button, Form, Tab, Tabs } from "@heroui/react";
import { CreateTokenInputDex } from "@chainstream-io/sdk";
import { Curve, CurveType } from "@liberfi/react-launchpad";
import {
  ExclamationIcon,
  useAuth,
  useAuthenticatedCallback,
  useTranslation,
  useUpload,
} from "@liberfi/ui-base";
import { SOL_TOKEN_DECIMALS } from "@liberfi/ui-dex/libs";
import { launchPadCurvePoints } from "../../states";
import { useCreateToken, useUploadMetadata } from "../../hooks";
import { PumpLaunchPadBasicForm } from "./PumpLaunchPadBasicForm";
import { PumpLaunchPadSocialsForm } from "./PumpLaunchPadSocialsForm";
import {
  defaultPumpLaunchPadFormValues,
  PumpLaunchPadFormSchema,
  PumpLaunchPadFormValues,
} from "../../types";
import { isEmpty, pick } from "lodash-es";

const NEW_TOKEN_DECIMALS = 6; // fixed decimals for new token
const MIGRATE_FEE = 0.02;
const SUPPLY = 1e9;
const REAL_RESERVED_TOKEN = 793_100_000;
const RAISED_SOL = 35;

export type PumpLaunchPadFormProps = {
  suggestedImage?: string;
  suggestedName?: string;
  suggestedSymbol?: string;
  className?: string;
};

export function PumpLaunchPadForm({
  suggestedImage,
  suggestedName,
  suggestedSymbol,
  className,
}: PumpLaunchPadFormProps) {
  const { t } = useTranslation();

  const [formStep, setFormStep] = useState<"basic" | "socials">("basic");

  const formMethods = useForm<PumpLaunchPadFormValues>({
    mode: "onBlur",
    reValidateMode: "onBlur",
    resolver: zodResolver(PumpLaunchPadFormSchema),
    defaultValues: {
      ...defaultPumpLaunchPadFormValues,
      name: suggestedName,
      ticker: suggestedSymbol,
      image: suggestedImage,
    },
  });

  const { handleSubmit, reset, formState, setValue } = formMethods;

  useEffect(() => {
    if (suggestedSymbol) {
      setValue("ticker", suggestedSymbol, { shouldDirty: true, shouldValidate: true });
    }
  }, [suggestedSymbol, setValue]);

  useEffect(() => {
    if (suggestedImage) {
      setValue("image", suggestedImage, { shouldDirty: true, shouldValidate: true });
    }
  }, [suggestedImage, setValue]);

  useEffect(() => {
    if (suggestedName) {
      setValue("name", suggestedName, { shouldDirty: true, shouldValidate: true });
    }
  }, [suggestedName, setValue]);

  const isDisabled = useMemo(
    () =>
      !isEmpty(formState.errors) ||
      !formState.dirtyFields.name ||
      !formState.dirtyFields.ticker ||
      !formState.dirtyFields.image,
    [formState],
  );

  const setCurvePoints = useSetAtom(launchPadCurvePoints);

  // calculate preview curve points
  useEffect(() => {
    async function calculateCurvePoints() {
      try {
        // amount in decimals
        const supplyBn = new BigNumber(SUPPLY).shiftedBy(NEW_TOKEN_DECIMALS);
        const soldBn = new BigNumber(REAL_RESERVED_TOKEN).shiftedBy(NEW_TOKEN_DECIMALS);
        const raisedBn = new BigNumber(RAISED_SOL).shiftedBy(SOL_TOKEN_DECIMALS);
        const migrateFeeBn = new BigNumber(MIGRATE_FEE).shiftedBy(SOL_TOKEN_DECIMALS);

        const points = Curve.getPoolCurvePointByInit({
          curveType: CurveType.CONSTANT_PRODUCT,
          supply: supplyBn,
          totalSell: soldBn,
          totalLockedAmount: new BigNumber(0),
          totalFundRaising: raisedBn,
          migrateFee: migrateFeeBn,
          decimalA: NEW_TOKEN_DECIMALS,
          decimalB: SOL_TOKEN_DECIMALS,
          pointCount: 40,
        });

        setCurvePoints(
          points.map((p) => ({
            x: new BigNumber(p.totalSellSupply).toNumber(),
            price: new BigNumber(p.price).decimalPlaces(10).toNumber(),
            percent: new BigNumber(p.price).div(points[0].price).times(100).toNumber(),
          })),
        );
      } catch (e) {
        console.error(e);
      }
    }
    calculateCurvePoints();
  }, [setCurvePoints]);

  const { user } = useAuth();

  const createToken = useCreateToken();

  const uploadMetadata = useUploadMetadata();

  const upload = useUpload();

  const onSubmit = useAuthenticatedCallback(
    async (data: PumpLaunchPadFormValues) => {
      try {
        if (data.image && !data.image.startsWith("https://ipfs.io/ipfs")) {
          try {
            const response = await fetch(data.image);
            const blob = await response.blob();
            const file = new File([blob], "image.jpg", { type: blob.type });
            data.image = await upload(file);
          } catch (e) {
            console.error("upload image error", e);
          }
        }

        const uri = await uploadMetadata({
          symbol: data.ticker,
          ...pick(data, ["name", "image", "description", "website", "twitter", "telegram"]),
        });

        await createToken({
          chain: CHAIN_ID.SOLANA,
          dex: CreateTokenInputDex.pumpfun,
          userAddress: user?.solanaAddress ?? "",
          name: data.name,
          symbol: data.ticker,
          image: data.image,
          uri: uri ?? "",
        });
      } catch (e) {
        console.error(e);
      }
    },
    [createToken, user?.solanaAddress, uploadMetadata, upload],
  );

  useEffect(() => {
    // It's recommended to reset in useEffect as execution order matters
    if (formState.isSubmitSuccessful) {
      reset();
    }
  }, [formState, reset]);

  const formStepErrors = useMemo<Record<string, boolean>>(
    () => ({
      basic:
        !!formState.errors.name ||
        !!formState.errors.ticker ||
        !!formState.errors.image ||
        !!formState.errors.description,
      socials:
        !!formState.errors.twitter || !!formState.errors.telegram || !!formState.errors.website,
    }),
    // should not depend on formState.errors directly
    [formState],
  );

  return (
    <FormProvider {...formMethods}>
      <Form className={clsx("gap-4 justify-between", className)} onSubmit={handleSubmit(onSubmit)}>
        <div className="w-full flex flex-col gap-4">
          <Tabs
            variant="underlined"
            className="sticky top-0 z-10 bg-content1"
            fullWidth
            classNames={{ panel: "w-full p-0" }}
            selectedKey={formStep}
            onSelectionChange={setFormStep as (key: Key) => void}
            // TODO heroui bug: tab animation conflicts with modal animation
            disableAnimation
          >
            {["basic", "socials"].map((step) => (
              <Tab
                key={step}
                title={
                  formStepErrors[step] ? (
                    <Badge
                      isOneChar
                      showOutline={false}
                      color="danger"
                      size="sm"
                      content={<ExclamationIcon width={12} height={12} />}
                    >
                      {t(`extend.launchpad.${step}_options`)}
                    </Badge>
                  ) : (
                    t(`extend.launchpad.${step}_options`)
                  )
                }
              />
            ))}
          </Tabs>

          <PumpLaunchPadBasicForm className={clsx({ hidden: formStep !== "basic" })} />

          <PumpLaunchPadSocialsForm className={clsx({ hidden: formStep !== "socials" })} />
        </div>

        <div className="w-full mt-6 sticky bottom-0 z-10">
          <Button
            fullWidth
            type="submit"
            className="disabled:opacity-100 disabled:bg-bullish-500"
            color="primary"
            isLoading={formState.isSubmitting}
            isDisabled={isDisabled}
            disableRipple
          >
            {t("extend.launchpad.submit")}
          </Button>
          {/* bottom padding & mask */}
          <div className="h-4 bg-content1"></div>
        </div>
      </Form>
    </FormProvider>
  );
}
