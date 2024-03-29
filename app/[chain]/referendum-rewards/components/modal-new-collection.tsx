import { useAppStore } from "@/app/zustand";
import { useForm } from "react-hook-form";
import { CollectionConfiguration } from "../types";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { SendAndFinalizeResult } from "@/types";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalProps,
} from "@nextui-org/modal";
import { Input } from "@nextui-org/input";
import { rewardsConfig } from "@/config/rewards";
import { TxButton } from "@/components/TxButton";
import { titleCase } from "@/components/util";
import { Button } from "@nextui-org/button";
import { Deposit } from "@/hooks/use-deposit";
import { getTxCollectionCreate } from "@/config/txs";
import { usePolkadotApis } from "@/context/polkadot-api-context";
import { usePolkadotExtension } from "@/context/polkadot-extension-context";
import { useUserCollections } from "@/hooks/use-user-collections";
import { TxTypes } from "@/components/util-client";

type PropType = Omit<ModalProps, "children"> & {
  setCollectionConfig: (config: CollectionConfiguration) => void;
  setIsNewCollectionLoading: (isLoading: boolean) => void;
  isTxPending: boolean;
  setIsTxPending: Dispatch<SetStateAction<boolean>>;
};

export default function ModalCreateNFTCollection({
  setCollectionConfig,
  setIsNewCollectionLoading,
  isTxPending,
  setIsTxPending,
  ...props
}: PropType) {
  const { isOpen, onOpenChange } = props;

  const [error, setError] = useState({
    message: "",
    name: "",
  });
  const { activeChainName, apiStates } = usePolkadotApis();
  const { selectedAccount } = usePolkadotExtension();

  const apiAssetHub = apiStates?.assetHub?.api;

  const [txCollectionCreate, setTxCollectionCreate] =
    useState<TxTypes>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      const result = await getTxCollectionCreate(
        activeChainName,
        selectedAccount?.address
      );
      setTxCollectionCreate(result);
    };

    fetchData();
  }, [activeChainName, selectedAccount?.address]);

  const txCreateCollection = useMemo(async () => {
    return await getTxCollectionCreate(
      activeChainName,
      selectedAccount?.address
    );
  }, [activeChainName, selectedAccount]);

  const { refetch } = useUserCollections();

  const formMethods = useForm({
    defaultValues: {
      name: "",
      description: "",
      imageFile: null,
    },
  });

  const {
    watch,
    register,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = formMethods;

  const watchFormFields = watch();

  const onFinished = async (
    data: SendAndFinalizeResult | SendAndFinalizeResult[]
  ) => {
    console.log("onFinished", data);

    if (Array.isArray(data)) {
      data = data[0];
    }

    const { status, events, blockHeader } = data || {};

    if (status === "success") {
      const newCollectionIdEvent = events?.find(
        (e) => e.event.section === "nfts" && e.event.method === "Created"
      );

      const newCollectionId = newCollectionIdEvent?.event?.data[0];
      console.log(
        "the new id of your created collection is",
        newCollectionId.toHuman()
      );

      await refetch();

      setCollectionConfig({
        id: newCollectionId.toString(),
        name: watchFormFields.name,
        description: watchFormFields.description,
        file: watchFormFields.imageFile,
        isNew: true,
      });
      setIsNewCollectionLoading(false);
    }

    setTimeout(() => {
      onOpenChange?.(false);
      if (!isTxPending) {
        setIsNewCollectionLoading(false);
      }
    }, 1000);
  };

  const onModalClose = (onClose: () => void) => {
    if (!isTxPending) {
      setIsNewCollectionLoading(false);
    }
    onClose();
  };

  const onSubmit = async (data: any) => {
    const result = await fetch("/api/new-collection/", {
      method: "POST",
      body: JSON.stringify(watchFormFields),
    });

    console.log("result from create collection", result);

    return result;
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="top-center"
      size="2xl"
      radius="sm"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Create a new NFT collection on {titleCase(activeChainName)} Asset
              Hub
            </ModalHeader>

            <ModalBody>
              <p className="form-helper text-sm">
                You need a collection for your NFTs on{" "}
                {titleCase(activeChainName)} Asset Hub. Create one here. The
                metadata of the collection (image, name, description) will be
                set in the next step when your rewards transactions are signed.
              </p>

              <form className="flex w-full flex-wrap gap-4">
                <Input
                  isRequired
                  label="Collection Name"
                  placeholder="The name of your new collection"
                  type="text"
                  {...register("name")}
                />
                <Input
                  isRequired
                  label="Collection Description"
                  placeholder="The description of your new collection"
                  type="text"
                  {...register("description")}
                />

                <div className="text-xs flex flex-col overflow-auto px-3">
                  <label
                    htmlFor={`imageFile`}
                    className="block font-medium text-foreground-600 text-tiny cursor-text will-change-auto origin-top-left transition-all !duration-200 !ease-out motion-reduce:transition-none mb-0 pb-0"
                  >
                    Collection Image (max 3MB)
                  </label>
                  <input
                    accept={rewardsConfig.acceptedNftFormats.join(",")}
                    type="file"
                    {...register(`imageFile`)}
                  />
                </div>
                {errors.imageFile && (
                  <span className="w-full text-sm text-red-500">
                    <>{errors.imageFile.message}</>
                  </span>
                )}
              </form>
              {error.message && (
                <div className="text-red-500 text-sm">{error.message}</div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button
                type="button"
                onClick={() => onModalClose(onClose)}
                className="w-full"
              >
                Cancel
              </Button>
              <TxButton<SendAndFinalizeResult>
                color="secondary"
                className="w-full"
                successText="Collection created!"
                extrinsic={txCollectionCreate}
                loadingText="Creating collection..."
                onFinished={onFinished}
                onPendingChange={setIsTxPending}
                deposits={[
                  {
                    type: Deposit.Collection,
                  },
                ]}
              >
                Create Collection
              </TxButton>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
