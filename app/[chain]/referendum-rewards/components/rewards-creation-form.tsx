"use client";

import { useReferenda } from "@/hooks/vote/use-referenda";
import { Input } from "@nextui-org/input";
import { Select, SelectItem, SelectSection } from "@nextui-org/select";
import { useEffect, useState } from "react";
import { useReferendumDetail } from "@/hooks/vote/use-referendum-detail";
import { InlineLoader } from "@/components/inline-loader";
import { Button } from "@nextui-org/button";
import { RewardsCreationRarityFields } from "./rewards-rarity-fields";
import { rewardsConfig } from "@/config/rewards";
import { FormProvider, useForm } from "react-hook-form";
import { SubstrateChain } from "@/types";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDisclosure } from "@nextui-org/modal";
import ModalCreateNFTCollection from "./modal-new-collection";
import { CollectionConfiguration, GenerateRewardsResult } from "../types";
import ModalAnalyzeSendout from "./modal-analyze-sendout";
import { bnToBn } from "@polkadot/util";
import FormActions from "./form-actions";
import { rewardsSchema } from "../rewards-schema";
import { usePolkadotApis } from "@/context/polkadot-api-context";
import { usePolkadotExtension } from "@/context/polkadot-extension-context";
import { useUserCollections } from "@/hooks/use-user-collections";

export default function RewardsCreationForm({
  chain,
}: {
  chain: SubstrateChain;
}) {
  const [isCollectionCreatePending, setIsCollectionCreatePending] =
    useState(false);
  const { activeChainName, activeChainInfo } = usePolkadotApis();
  const { ss58Format } = activeChainInfo;
  const { selectedAccount } = usePolkadotExtension();

  const chainRewardsSchema = rewardsSchema(
    activeChainName,
    selectedAccount?.address,
    ss58Format
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
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = formMethods;

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

  const { data: userCollections, isLoading: isUserCollectionsLoading } =
    useUserCollections();

  const [refIndex, setRefIndex] = useState<number>(-1);
  const { data: referendumDetail, isLoading: isReferendumDetailLoading } =
    useReferendumDetail(watchFormFields.refIndex);

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

  return (
    <FormProvider {...formMethods}>
      <form className="test">
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

              {watchFormFields.refIndex && (
                <span className="text-xs flex items-start mt-1 ml-1 min-h-unit-10 align-top">
                  Referendum {`${watchFormFields.refIndex}`}
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
              description="Where trading royalties should go to on Asset Hub.
                  80% will go to the entered address, 20% to the Proof of Chaos multisig. You can copy your address from the account dropdown top right."
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
            {userCollections && userCollections?.length > 0 ? (
              <Select
                aria-label="Collection Id"
                items={userCollections}
                key="0"
                value={watchFormFields.collectionConfig?.id}
                label="Collection Id"
                placeholder="Select an existing collection"
                isLoading={isUserCollectionsLoading}
                classNames={{
                  label: "after:content-['*'] after:text-danger after:ml-0.5",
                }}
                description="Select a collection that you are the owner of. NFTs will be minted to this collection."
                isInvalid={!!errors.collectionConfig?.id}
                isDisabled={isUserCollectionsLoading || isNewCollectionLoading}
                color={!!errors.collectionConfig?.id ? "danger" : "default"}
                errorMessage={
                  !!errors.collectionConfig?.id &&
                  `${errors.collectionConfig.id?.message}`
                }
                {...register("collectionConfig.id", {
                  required: "Please select a collection",
                })}
              >
                {(collection) => (
                  <SelectItem
                    key={collection.collectionId}
                    value={collection.collectionId}
                    description={`${collection.collection.items} items`}
                  >
                    {collection.collectionId}
                  </SelectItem>
                )}
              </Select>
            ) : (
              <Select
                key="1"
                placeholder="You don't have any collections yet"
                isDisabled={true}
                isLoading={isUserCollectionsLoading}
                description="Select a collection that you are the owner of. NFTs will be minted to this collection."
              >
                <SelectItem key="nocollection">No collection</SelectItem>
              </Select>
            )}
            {/* <Input
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
            /> */}
            {/* <p>{errors?.["collectionConfig.id"]?.message}</p> */}
            <div className="flex h-100">
              {userCollections && userCollections.length > 0 ? (
                "or"
              ) : (
                <span className="text-xl">→</span>
              )}
            </div>
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

        <FormActions chain={chain} className="my-8" />

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
