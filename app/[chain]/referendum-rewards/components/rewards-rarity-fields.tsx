import { Input, Textarea } from "@nextui-org/input";
import { Switch } from "@nextui-org/switch";
import { useState } from "react";
import { rewardsConfig } from "@/config/rewards";
import { RewardConfiguration } from "../types";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import clsx from "clsx";
import styles from "./style.module.scss";
import { titleCase } from "@/components/util";
import { useFormContext } from "react-hook-form";
import { rewardsSchema } from "../rewards-schema";
import { Checkbox } from "@nextui-org/checkbox";
import { usePolkadotApis } from "@/context/polkadot-api-context";
import { Tooltip } from "@nextui-org/tooltip";

export function RewardsCreationRarityFields({
  rarity,
  rewardConfig,
}: {
  rarity: string;
  rewardConfig: RewardConfiguration;
}) {
  const formMethods = useFormContext();
  const {
    register,
    formState: { errors },
  } = formMethods;
  const { acceptedNftFormats, acceptedNonImageFormats } = rewardsConfig;
  const [isUploadSelected, setIsUploadSelected] = useState(true);

  const { activeChainName, activeChainInfo } = usePolkadotApis();
  const { ss58Format } = activeChainInfo;

  const chainRewardsSchema = rewardsSchema(
    activeChainName,
    undefined,
    ss58Format
  );

  let optionIndex = rewardConfig.options.findIndex(
    (opt) => opt.rarity === rarity
  );

  const [shouldHaveCover, setShouldHaveCover] = useState<{
    [key: string]: boolean;
  }>({
    common: false,
    rare: false,
    epic: false,
  });

  return (
    <div
      className={clsx(`flex flex-col p-1 gap-4 w-full form-fields-${rarity}`, {
        [styles[`formFields${rarity}`]]: [
          "common",
          "rare",
          "epic",
          "legendary",
        ].includes(rarity),
      })}
    >
      <Card
        shadow="sm"
        radius="sm"
        className="w-full h-full rounded shadow-md bg-transparent"
      >
        <CardHeader>
          <h3 className="text-lg text-center w-full">
            {titleCase(rarity)} NFT
          </h3>
        </CardHeader>
        <CardBody className="flex gap-3 bg-background">
          <div className="text-sm flex justify-start items-center justify-between">
            <div className="flex items-center">
              <span className="mr-2">upload file</span>
              <Switch
                size="sm"
                color="secondary"
                onChange={() => {
                  setIsUploadSelected(!isUploadSelected);
                }}
              >
                ipfs cid
              </Switch>
            </div>
            {!isUploadSelected && (
              <Checkbox
                size="sm"
                color="secondary"
                isSelected={shouldHaveCover[rarity]}
                onValueChange={(value) => {
                  setShouldHaveCover({
                    ...shouldHaveCover,
                    [rarity]: value,
                  });
                }}
              >
                <Tooltip content="Add a cover image (when using e.g. music or video as NFTs)">
                  <span>Cover</span>
                </Tooltip>
              </Checkbox>
            )}
          </div>
          <span className="text-tiny text-foreground-400">
            Either upload files here but be limited in size, or directly set a
            link to an ipfs file you uploaded somewhere.
          </span>
          <div className="text-xs flex flex-col">
            {isUploadSelected ? (
              <>
                <div className="relative w-full inline-flex tap-highlight-transparent shadow-sm px-3 bg-default-100 data-[hover=true]:bg-default-200 group-data-[focus=true]:bg-default-100  rounded-medium flex-col items-start justify-center gap-0 transition-background motion-reduce:transition-none !duration-150 outline-none group-data-[focus-visible=true]:z-10 group-data-[focus-visible=true]:ring-2 group-data-[focus-visible=true]:ring-focus group-data-[focus-visible=true]:ring-offset-2 group-data-[focus-visible=true]:ring-offset-background py-2 overflow-x-clip">
                  <label className="block font-medium text-foreground-600 text-tiny cursor-text will-change-auto origin-top-left transition-all !duration-200 !ease-out motion-reduce:transition-none mb-1 pb-0">
                    Upload {rarity} File (max 1.5MB)
                  </label>

                  <input
                    id={`file-${rarity}`}
                    accept={acceptedNftFormats.join(",")}
                    type="file"
                    className="mt-0 pb-2"
                    {...register(`options.${optionIndex}.file`)}
                    onChange={(e) => {
                      const mediaType = e.target.files?.[0]?.type;
                      const needsCover =
                        mediaType && acceptedNonImageFormats.includes(mediaType)
                          ? true
                          : false;

                      setShouldHaveCover({
                        ...shouldHaveCover,
                        [rarity]: needsCover,
                      });
                    }}
                  />
                  {/* @ts-ignore */}
                  {errors?.options?.[optionIndex]?.file && (
                    <span className="w-full text-tiny text-danger px-1">
                      {/* @ts-ignore */}
                      <>{errors?.options?.[optionIndex].file?.message}</>
                    </span>
                  )}
                </div>
                {shouldHaveCover[rarity] && (
                  <div className="mt-4 relative w-full inline-flex tap-highlight-transparent shadow-sm px-3 bg-default-100 data-[hover=true]:bg-default-200 group-data-[focus=true]:bg-default-100 rounded-medium flex-col items-start justify-center gap-0 transition-background motion-reduce:transition-none !duration-150 outline-none group-data-[focus-visible=true]:z-10 group-data-[focus-visible=true]:ring-2 group-data-[focus-visible=true]:ring-focus group-data-[focus-visible=true]:ring-offset-2 group-data-[focus-visible=true]:ring-offset-background min-h-unit-12 py-2 overflow-x-clip">
                    <label className="block font-medium text-foreground-600 text-tiny cursor-text will-change-auto origin-top-left transition-all !duration-200 !ease-out motion-reduce:transition-none mb-1 pb-0">
                      Upload {rarity} Cover Image (max 1.5MB)
                    </label>

                    <input
                      id={`file-${rarity}`}
                      accept={acceptedNftFormats.join(",")}
                      type="file"
                      className="mt-0 pb-2"
                      {...register(`options.${optionIndex}.fileCover`)}
                    />
                    {/* @ts-ignore */}
                    {errors?.options?.[optionIndex]?.fileCover && (
                      <span className="w-full text-tiny text-danger px-1">
                        {/* @ts-ignore */}
                        <>{errors?.options?.[optionIndex].fileCover?.message}</>
                      </span>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                <Input
                  id={`imageCid-${rarity}`}
                  label={`IPFS  CID of ${rarity} NFT`}
                  placeholder={`ipfs://ipfs/...`}
                  type="text"
                  className="min-h-unit-12"
                  color={
                    !!errors[`options.${optionIndex}].imageCid`]
                      ? "danger"
                      : "default"
                  }
                  errorMessage={
                    //@ts-ignore
                    !!errors?.options?.[optionIndex]?.imageCid &&
                    //@ts-ignore
                    errors?.options?.[optionIndex]?.imageCid?.message
                  }
                  {...register(`options.${optionIndex}.imageCid`, {})}
                />
                {shouldHaveCover[rarity] && (
                  <Input
                    id={`coverCid-${rarity}`}
                    label={`IPFS  Cover CID of ${rarity} NFT`}
                    placeholder={`ipfs://ipfs/...`}
                    type="text"
                    className="min-h-unit-12 mt-2"
                    color={
                      !!errors[`options.${optionIndex}].coverCid`]
                        ? "danger"
                        : "default"
                    }
                    errorMessage={
                      //@ts-ignore
                      !!errors?.options?.[optionIndex]?.coverCid &&
                      //@ts-ignore
                      errors?.options?.[optionIndex]?.coverCid?.message
                    }
                    {...register(`options.${optionIndex}.coverCid`, {})}
                  />
                )}
              </>
            )}
          </div>
          <Input
            type="text"
            className="hidden"
            value={rarity}
            id={`rarity-${rarity}`}
            {...register(`options.${optionIndex}.rarity`)}
          />
          <Input
            id={`name-${rarity}`}
            label={`Title of ${rarity} NFT`}
            placeholder={`Enter title of ${rarity} NFT`}
            classNames={{
              label: "after:content-['*'] after:text-danger after:ml-0.5",
            }}
            //@ts-ignore
            isInvalid={!!errors?.options?.[optionIndex]?.title}
            color={
              !!errors[`options.${optionIndex}].title`] ? "danger" : "default"
            }
            errorMessage={
              //@ts-ignore
              !!errors?.options?.[optionIndex]?.title &&
              //@ts-ignore
              errors?.options?.[optionIndex]?.title?.message
            }
            type="text"
            {...register(`options.${optionIndex}.title`)}
          />
          <Textarea
            id={`description-${rarity}`}
            label={`Description of ${rarity} NFT (1000 chars)`}
            placeholder={`Enter description of ${rarity} NFT`}
            maxLength={1000}
            // {...register(`options[${optionIndex}].description`, {
            //   validate: {},
            // })}
          />
          <Input
            id={`artist-${rarity}`}
            label={`Artist of ${rarity} NFT`}
            placeholder={`Enter artist of ${rarity} NFT`}
            type="text"
            isInvalid={!!errors[`options.${optionIndex}].artist`]}
            errorMessage={
              !!errors[`options.${optionIndex}].artist`] &&
              `${errors[`options.${optionIndex}].artist`]?.message}`
            }
            {...register(`options.${optionIndex}.artist`)}
          />
        </CardBody>
      </Card>
    </div>
  );
}
