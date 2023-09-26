"use client";

import { useReferenda } from "@/hooks/vote/use-referenda";
import { Input } from "@nextui-org/input";
import { Select, SelectItem, SelectSection } from "@nextui-org/select";
import { useEffect, useState } from "react";
import { useReferendumDetail } from "@/hooks/vote/use-referendum-detail";
import { InlineLoader } from "@/components/inline-loader";
import { Button } from "@nextui-org/button";
import { Progress } from "@nextui-org/progress";
import { RewardsCreationRarityFields } from "./rewards-rarity-fields";
import { rewardsConfig } from "@/config/rewards";
import { vividButtonClasses } from "@/components/primitives";
import clsx from "clsx";
import { FormProvider, useForm } from "react-hook-form";
import { rewardsSchema, validateAddress } from "../util";
import { SubstrateChain } from "@/types";
import { getChainInfo } from "@/config/chains";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSubstrateChain } from "@/context/substrate-chain-context";
import { useAppStore } from "@/app/zustand";
import { useDisclosure } from "@nextui-org/modal";
import ModalCreateNFTCollection from "./modal-new-collection";
import {
  CollectionConfiguration,
  GenerateRewardsResult,
  RewardConfiguration,
  RewardCriteria,
  SendAndFinalizeResult,
} from "../types";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import ModalAnalyzeSendout from "./modal-analyze-sendout";
import { TxButton } from "@/components/TxButton";
import { bnToBn } from "@polkadot/util";
import { mergeWithDefaultConfig } from "@/components/util";
import { TxTypes } from "@/components/util-client";
import FormActions from "./form-actions";

type ConfigReqBody = RewardConfiguration & {
  blockNumbers?: (number | undefined)[];
  txHashes: (string | undefined)[];
};

export default function RewardsCreationForm({
  chain,
}: {
  chain: SubstrateChain;
}) {
  const [isCollectionCreatePending, setIsCollectionCreatePending] =
    useState(false);
  const { ss58Format, name: activeChainName } = getChainInfo(chain);
  const chainRewardsSchema = rewardsSchema(activeChainName, ss58Format);

  const explode = useAppStore((s) => s.explode);

  const walletAddress = useAppStore(
    (state) => state.user.actingAccount?.address
  );

  type TypeRewardsSchema = z.infer<typeof chainRewardsSchema>;
  const { DEFAULT_REWARDS_CONFIG } = rewardsConfig;

  // const openModal = useAppStore((state) => state.openModal);

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const {
    isOpen: isAnalyzeOpen,
    onOpen: onAnalzeOpen,
    onOpenChange: onAnalyzeOpenChange,
    onClose: onAnalyzeClose,
  } = useDisclosure();

  const [isNewCollectionLoading, setIsNewCollectionLoading] = useState(false);

  const [rewardSendoutData, setRewardSendoutData] =
    useState<GenerateRewardsResult>(undefined);

  const totalFees =
    rewardSendoutData?.fees?.nfts && rewardSendoutData?.fees?.deposit
      ? bnToBn(rewardSendoutData.fees.nfts).add(
          bnToBn(rewardSendoutData.fees.deposit)
        )
      : undefined;

  const [formStep, setFormStep] = useState(0);
  const nextFormStep = () => setFormStep((currentStep) => currentStep + 1);
  const prevFormStep = () => setFormStep((currentStep) => currentStep - 1);

  const formMethods = useForm<TypeRewardsSchema>({
    resolver: zodResolver(chainRewardsSchema),
    defaultValues: DEFAULT_REWARDS_CONFIG,
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    getValues,
    setValue,
    watch,
    setError,
  } = formMethods;
  const { activeChain } = useSubstrateChain();

  const watchFormFields = watch();

  useEffect(() => {
    console.log("errors", errors);
  }, [errors]);

  const {
    data: { referenda: pastReferenda } = {
      referenda: [],
    },
    isLoading: isPastReferendaLoading,
  } = useReferenda("past", false);

  const [refIndex, setRefIndex] = useState<number>(-1);
  const { data: referendumDetail, isLoading: isReferendumDetailLoading } =
    useReferendumDetail(refIndex.toString());

  // function is passed to the modal in order to change the state of the form fields
  function setCollectionConfig(collectionConfig: CollectionConfiguration) {
    setValue("collectionConfig", {
      ...watchFormFields.collectionConfig,
      ...collectionConfig,
    });
  }

  function onModalOpenChange(isOpen: boolean) {
    if (!isCollectionCreatePending) {
      setIsNewCollectionLoading(false);
    }
    onOpenChange();
  }

  async function createNewCollection() {
    setIsNewCollectionLoading(true);
    onOpen();
  }

  async function actionCreateConfigNFT(configReqBody: ConfigReqBody) {
    const createConfigRes = await fetch("/api/create-config-nft", {
      method: "POST",
      body: JSON.stringify(configReqBody),
    });

    console.log("create config nft result", createConfigRes);
  }

  function onFinished(
    results: SendAndFinalizeResult[] | SendAndFinalizeResult
  ): void {
    explode(true);
    console.log("onfinished", results);

    if (!Array.isArray(results)) {
      results = [results];
    }

    if (results.every((res) => res.status === "success")) {
      const sendoutConfig = rewardSendoutData?.config ?? watchFormFields;

      const configReqBody = {
        ...mergeWithDefaultConfig(sendoutConfig),
        chain: activeChainName,
        criteria: watchFormFields.criteria as RewardCriteria,
        blockNumbers: results.map((res) => res.blockHeader?.number.toNumber()),
        txHashes: results.map((res) => res.txHash),
      };

      actionCreateConfigNFT(configReqBody);
    }
  }

  async function onSubmit(data: TypeRewardsSchema) {
    // append all data needed for the rewards creation to a FormData object
    const formData = new FormData();

    // form fields
    formData.append("rewardConfig", JSON.stringify(data));

    // chain + walletAddress of the sender
    formData.append("chain", chain);
    if (walletAddress) {
      formData.append("sender", walletAddress);
    }

    // uploaded files
    data.options?.forEach((option) => {
      if (!option.imageCid && option.file?.[0]) {
        formData.append(
          `${option.rarity}File`,
          option.file[0],
          option.file[0].name
        );
      }
    });
    if (data.collectionConfig.file?.[0]) {
      formData.append(
        "collectionImage",
        data.collectionConfig.file[0],
        data.collectionConfig.file[0].name
      );
    }

    const response = await fetch("/api/rewards", {
      method: "POST",
      body: formData,
    });
    const responseData = await response.json();
    console.log("raw response data", responseData);

    if (!response.ok) {
      console.error("error getting response from server", responseData);
      setError("root", {
        message: "Error reaching server",
      });
    }
    if (responseData.errors) {
      const errors = responseData.errors;
      if (errors.criteria) {
        setError("criteria", {
          type: "server",
          message: errors.criteria,
        });
      } else if (errors.refIndex) {
        setError("refIndex", {
          type: "server",
          message: errors.refIndex,
        });
      } else {
        setError("root", {
          message: errors.form,
        });
      }
    }

    console.log("response", response);

    if (response.ok && responseData.status === "success") {
      const maxTxsPerBatch =
        Math.floor(
          rewardsConfig.NFT_BATCH_SIZE_MAX / responseData?.txsCount?.txsPerVote
        ) * responseData?.txsCount?.txsPerVote;

      let kusamaAssetHubTxsBatches: TxTypes[] | undefined =
        responseData?.kusamaAssetHubTxs;

      if (kusamaAssetHubTxsBatches && Array.isArray(kusamaAssetHubTxsBatches)) {
        // group the kusamaAssetHubTxs in batches of max size maxTxsPerbatch making sure that txs belonging together (multiples of 13) are never split to different batches
        const batches = kusamaAssetHubTxsBatches.reduce((acc, tx, index) => {
          const batchIndex: number = Math.floor(index / maxTxsPerBatch);
          if (!acc[batchIndex]) {
            acc[batchIndex] = [];
          }
          acc[batchIndex].push(tx);
          return acc;
        }, [] as TxTypes[][]);

        setRewardSendoutData({
          ...responseData,
          kusamaAssetHubTxsBatches: batches,
        });
      } else {
        setRewardSendoutData({
          ...responseData,
        });
      }

      nextFormStep();
    }
  }

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)} className="test">
        <h3 className="mb-4 text-lg">What should be rewarded?</h3>
        <div className="flex mb-4 min-h-[100px]">
          <div className="hidden md:flex md:w-1/3 text-xs pr-8">
            At the moment we support rewarding participation in OpenGov
            Referenda. All participants of your selected referendum will receive
            1 of the NFTs you set below.
          </div>
          <div className="w-full md:w-2/3 flex gap-4 flex-wrap md:flex-nowrap">
            <Select
              classNames={{
                label: "after:content-['*'] after:text-danger after:ml-0.5",
              }}
              className="w-full md:w-1/2"
              label="Reward Criteria"
              placeholder={"Select Reward Criteria"}
              disabledKeys={[
                "criteria",
                "aye",
                "first",
                "reputable",
                "extrinsic",
              ]}
              defaultSelectedKeys={[watchFormFields.criteria]}
              selectionMode="single"
              isInvalid={!!errors.criteria}
              errorMessage={!!errors.criteria && `${errors.criteria?.message}`}
              {...register("criteria", {
                required: "Reward Criteria is required",
              })}
            >
              <SelectSection showDivider title="Available">
                <SelectItem key="referenda" value="referenda">
                  All Referendum Participants
                </SelectItem>
              </SelectSection>
              <SelectSection title="Coming Soon?">
                <SelectItem key="criteria" value="criteria">
                  Votes meeting threshold (e.g. &gt; 5 KSM)
                </SelectItem>
                <SelectItem key="first" value="first">
                  First N Voters
                </SelectItem>
                <SelectItem key="reputable" value="reputable">
                  Reputable Voters
                </SelectItem>
                <SelectItem key="aye" value="aye">
                  All Aye Voters
                </SelectItem>
                <SelectItem key="extrinsic" value="aye">
                  Any Aritrary Extrinsic Caller
                </SelectItem>
              </SelectSection>
            </Select>
            <div className="w-full md:w-1/2">
              <Select
                label="Referendum Index"
                classNames={{
                  label: "after:content-['*'] after:text-danger after:ml-0.5",
                }}
                value={refIndex}
                isLoading={isPastReferendaLoading}
                placeholder={"Select any past referendum"}
                isInvalid={!!errors.refIndex}
                errorMessage={
                  !!errors.refIndex && `${errors.refIndex?.message}`
                }
                {...register("refIndex", {
                  required: "Please select a referendum",
                })}
              >
                {pastReferenda?.map(({ index }) => (
                  <SelectItem key={index} value={index}>
                    {index}
                  </SelectItem>
                ))}
              </Select>

              {refIndex !== -1 && (
                <span className="text-xs flex items-start mt-1 ml-1 min-h-unit-10 align-top">
                  You selected Referendum {`${refIndex}`}&nbsp;
                  {isReferendumDetailLoading ? (
                    <InlineLoader />
                  ) : (
                    `: ${referendumDetail?.title}`
                  )}
                </span>
              )}
            </div>
          </div>
        </div>

        <h3 className="mb-4 text-lg">Where should royalties go?</h3>
        <div className="flex mb-4 min-h-[100px]">
          <div className="hidden md:flex md:w-1/3 text-xs pr-8">
            Trading NFTs Asset Hub will generate royalties for arbitrary
            parties. Select, who those royalties should go to.
          </div>
          <div className="w-full md:w-2/3">
            <Input
              label="Royalty Address"
              classNames={{
                label: "after:content-['*'] after:text-danger after:ml-0.5",
              }}
              type="text"
              placeholder="Enter the address of the royalty receiver"
              description="Where trading royalties should go to (Kusama / Asset Hub).
                  80% will go to the entered address, 20% to the Proof of Chaos multisig."
              isInvalid={!!errors.royaltyAddress}
              color={!!errors.royaltyAddress ? "danger" : "default"}
              errorMessage={
                !!errors.royaltyAddress && `${errors.royaltyAddress?.message}`
              }
              {...register("royaltyAddress")}
            />
          </div>
        </div>

        <h3 className="mb-4 text-lg">Where should NFTs be collected?</h3>
        <div className="flex mb-4 min-h-[100px]">
          <div className="hidden md:flex md:w-1/3 text-xs pr-8">
            You can either choose any existing collection, that you have the
            rights to mint NFTs into, or create a new collection.
          </div>
          <div className="w-full md:w-2/3 flex gap-4 items-center flex-wrap md:flex-nowrap justify-center">
            <Input
              label="Collection Id"
              placeholder="The id of your existing collection"
              type="number"
              step="1"
              classNames={{
                label: "after:content-['*'] after:text-danger after:ml-0.5",
              }}
              description="Select a collection that you are the owner of. NFTs will be minted to this collection."
              isInvalid={!!errors.collectionConfig?.id}
              isDisabled={isNewCollectionLoading}
              color={!!errors.collectionConfig?.id ? "danger" : "default"}
              errorMessage={
                !!errors.collectionConfig?.id &&
                `${errors.collectionConfig.id?.message}`
              }
              {...register("collectionConfig.id")}
            />
            {/* <p>{errors?.["collectionConfig.id"]?.message}</p> */}
            <div className="flex h-100">or</div>
            <Button
              className="w-full"
              onClick={createNewCollection}
              color="secondary"
              isLoading={isNewCollectionLoading}
              variant="bordered"
            >
              {isNewCollectionLoading
                ? "Creating a new collection ..."
                : "Create A New Collection"}
            </Button>
          </div>
        </div>

        <h3 className="mb-4 text-lg">What are the rewards / NFTs?</h3>
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-2">
          {["common", "rare", "epic"].map((rarity) => (
            <RewardsCreationRarityFields
              key={rarity}
              rarity={rarity}
              rewardConfig={DEFAULT_REWARDS_CONFIG}
            />
          ))}
        </div>

        <FormActions className="mt-8" />

        <Card className="mt-4">
          <CardHeader className="mx-2 mt-2 text-xl">Action</CardHeader>
          <CardBody className="flex gap-4">
            <div className="flex items-center flex-wrap gap-2 text-tiny">
              <div
                className={clsx("flex flex-row gap-4 items-center", {
                  "text-gray-500": formStep !== 0,
                })}
              >
                {formStep === 0 && (
                  <span className="text-4xl text-secondary">→</span>
                )}
                <span className="text-4xl">1</span>Create on chain transactions
                based on your configuration above <br />
                (i.e. pin files to ipfs, calculate distribution of nfts, mint
                nft transactions, set nft attributes, ...)
              </div>
              {errors && errors.root && (
                <p className="text-danger w-full text-center mt-3">
                  <span>Rewards creation failed: {errors.root.message}</span>
                  <span className="block">Please try again</span>
                </p>
              )}

              <Button
                type="submit"
                isDisabled={isSubmitting || formStep !== 0}
                isLoading={isSubmitting}
                className={clsx("w-full h-20", vividButtonClasses)}
              >
                Generate {activeChain && <activeChain.icon />}reward
                transactions
              </Button>
              <Progress
                size="sm"
                isIndeterminate
                aria-label="Loading..."
                className="w-full"
                color="secondary"
              />
              <div className="text-tiny text-center flex justify-center w-full z-10">
                <span className="bg-content1/80 px-6">
                  🚀 Generating calls for reward distribution of referendum
                  {refIndex}
                </span>
              </div>
            </div>
            <div className="flex items-center flex-wrap gap-2 text-tiny">
              <div
                className={clsx(
                  "w-full flex flex-row gap-4 items-center flex-wrap",
                  {
                    "text-gray-500": formStep !== 1,
                  }
                )}
              >
                {formStep === 1 && (
                  <span className="text-4xl text-secondary">→</span>
                )}
                <span className="text-4xl">2</span>
                Start the sendout process. You will be asked to sign{" "}
                {rewardSendoutData?.kusamaAssetHubTxsBatches?.length ? (
                  <span className="text-warning text-xl">
                    {rewardSendoutData?.kusamaAssetHubTxsBatches?.length}
                  </span>
                ) : (
                  "some "
                )}
                transactions in sequence. Complete all for a full sendout.
                {rewardSendoutData && (
                  <Button
                    onClick={onAnalyzeOpenChange}
                    className="self-end flex-grow"
                  >
                    Analyze Sendout
                  </Button>
                )}
              </div>
              <TxButton
                extrinsic={rewardSendoutData?.kusamaAssetHubTxsBatches}
                requiredBalance={totalFees}
                variant="shadow"
                isDisabled={isSubmitting || formStep !== 1}
                className={clsx("w-full h-20 border-2", vividButtonClasses)}
                onFinished={onFinished}
              >
                Start the {activeChain && <activeChain.icon />} rewards sendout
              </TxButton>
            </div>
          </CardBody>
        </Card>

        <Input
          type="text"
          className="hidden"
          value={chain as SubstrateChain}
          id={`chain`}
          {...register(`chain`)}
        />

        {/* <pre className="text-xs">{JSON.stringify(watch(), null, 2)}</pre> */}
      </form>
      <ModalCreateNFTCollection
        setCollectionConfig={setCollectionConfig}
        setIsNewCollectionLoading={setIsNewCollectionLoading}
        onOpenChange={onModalOpenChange}
        isOpen={isOpen}
        isTxPending={isCollectionCreatePending}
        setIsTxPending={setIsCollectionCreatePending}
      />
      <ModalAnalyzeSendout
        sendoutData={rewardSendoutData}
        onOpenChange={onAnalyzeOpenChange}
        isOpen={isAnalyzeOpen}
      />
    </FormProvider>
  );
}
