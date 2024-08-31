"use client";

import { useReferenda } from "@/hooks/vote/use-referenda";
import { Input } from "@nextui-org/input";
import { Select, SelectItem } from "@nextui-org/select";
import { useEffect, useRef, useState } from "react";
import { useReferendumDetail } from "@/hooks/vote/use-referendum-detail";
import { InlineLoader } from "@/components/inline-loader";
import { Button } from "@nextui-org/button";
import { RewardsCreationRarityFields } from "./rewards-rarity-fields";
import { FormProvider, useForm, Controller } from "react-hook-form";
import { SubstrateChain } from "@/types";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDisclosure } from "@nextui-org/modal";
import ModalCreateNFTCollection from "./modal-new-collection";
import { CollectionConfiguration, GenerateRewardsResult, Item, VirtualizedDropdownProps } from "../types";
import ModalAnalyzeSendout from "./modal-analyze-sendout";
import { bnToBn } from "@polkadot/util";
import FormActions from "./form-actions";
import { rewardsSchema } from "../rewards-schema";
import { usePolkadotApis } from "@/context/polkadot-api-context";
import { usePolkadotExtension } from "@/context/polkadot-extension-context";
import { useUserCollections } from "@/hooks/use-user-collections";
import { FixedSizeList as List } from 'react-window';
import { ListChildComponentProps } from 'react-window';
import { Spinner } from '@nextui-org/react';

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
  const { DEFAULT_REWARDS_CONFIG } = activeChainInfo;

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
    control,
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

  //remove comma
  const cleanedReferenda = pastReferenda.map(referendum => {
    const cleanedIndex = referendum.index.replace(/,/g, ''); // Remove commas from the index
    return {
      ...referendum,
      index: cleanedIndex, // Replace the original index with the cleaned one
    };
  });

  //sort referenda
  const sortedReferenda = cleanedReferenda.sort((a, b) => {
    const aIndex = parseInt(a.index);
    const bIndex = parseInt(b.index);
    return bIndex - aIndex;
  });
  

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



  const VirtualizedDropdown: React.FC<VirtualizedDropdownProps> = ({ items, onSelectedChange, selectedValue, error, isLoading, // Use isLoading prop
  }) => {
    const dropdownRef = useRef(null); // Add a ref for the dropdown

    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (item: any) => {
      onSelectedChange(item); // Notify parent component or form
      setIsOpen(false); // Close dropdown
    };

    const rowRenderer = ({ index, style }: ListChildComponentProps) => {
      const item = items[index];
      return (
        <div style={style}
          key={item.index}
          onClick={() => onSelectedChange(item)}
          className="p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100">
          {`Referendum ${item.index}`}
        </div>
      );
    };

    return (
      <div className="relative w-full" ref={dropdownRef}>
        <div onClick={() => setIsOpen(!isOpen)}
          className="relative w-full inline-flex tap-highlight-transparent shadow-sm px-3 bg-default-100 data-[hover=true]:bg-default-200 group-data-[focus=true]:bg-default-100  rounded-medium flex-col items-start justify-center gap-0 transition-background motion-reduce:transition-none !duration-150 outline-none group-data-[focus-visible=true]:z-10 group-data-[focus-visible=true]:ring-2 group-data-[focus-visible=true]:ring-focus group-data-[focus-visible=true]:ring-offset-2 group-data-[focus-visible=true]:ring-offset-background py-2 overflow-x-clip">
          <label className="block font-medium text-foreground-600 text-tiny cursor-text will-change-auto origin-top-left transition-all !duration-200 !ease-out motion-reduce:transition-none mb-1 pb-0">
            Referendum Index
            <span className="text-red-500 required-dot">*</span>
          </label>
          <div className="text-foreground-500 text-small">
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <Spinner size="sm" /> {/* Spinner for loading indicator */}
                <span>Referenda loading...</span>
              </div>
            ) : selectedValue ? (
              `Referendum ${selectedValue}`
            ) : (
              'Select any past referendum'
            )}
          </div>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </span>
        </div>
        {error && (
          <div className="text-red-500 text-sm mt-2">
            {error.message}
          </div>
        )}
        {isOpen && (
          <div
            className="absolute z-50 mt-1 w-full bg-content1 shadow-lg max-h-60 rounded-md text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            <List
              height={200} // Adjust based on your needs
              itemCount={items.length}
              itemSize={35} // Adjust based on your item size
              width={"100%"} // Adjust based on your needs
              className="w-full flex flex-col gap-0.5 outline-none"
            >
              {rowRenderer}
            </List>
          </div>
        )}
      </div>
    );
  };

  return (
    <FormProvider {...formMethods}>
      <form className="test">
        <h3 className="mb-4 text-lg">Which Referendum?</h3>
        <div className="flex mb-4 min-h-[100px]">
          <div className="hidden md:flex md:w-1/3 text-xs pr-8">
            Select the referendum by its Index. All participants of your selected referendum will receive
            1 of the NFTs you set below.
          </div>
          <div className="w-full md:w-2/3 flex gap-4 flex-wrap md:flex-nowrap">

            {/* <Select
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
            </Select> */}
            <div className="w-full md:w-1/2">
              <Controller
                name="refIndex"
                control={control}
                rules={{ required: "Please select a referendum" }}
                render={({ field: { onChange, value } }) => (
                  <VirtualizedDropdown
                    items={sortedReferenda}
                    selectedValue={value}
                    onSelectedChange={(item: Item) => onChange(item.index)} // Ensure 'item' is typed
                    error={errors.refIndex}
                    isLoading={isPastReferendaLoading}
                  />
                )}
              />

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
                color={!!errors.collectionConfig?.id ? "danger" : "default"}
                isInvalid={!!errors.collectionConfig?.id}
                errorMessage={
                  !!errors.collectionConfig?.id &&
                  `${errors.collectionConfig.id?.message}`
                }
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
