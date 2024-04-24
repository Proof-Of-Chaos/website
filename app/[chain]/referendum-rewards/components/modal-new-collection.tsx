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

interface FormFields {
  name: string;
  description: string;
  imageFile: FileList | null;  // Specify that imageFile can be a FileList or null
}

export default function ModalCreateNFTCollection({
  setCollectionConfig,
  setIsNewCollectionLoading,
  isTxPending,
  setIsTxPending,
  ...props
}: PropType) {
  const { isOpen, onOpenChange } = props;
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

  const formMethods = useForm<FormFields>({
    defaultValues: {
      name: "",
      description: "",
      imageFile: null,
    },
  });

  const {
    watch,
    register,
    getValues,
    setError,
    clearErrors,
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

      let collectionFile;

      if (getValues().imageFile) {
        collectionFile = getValues().imageFile;

      } else {
        collectionFile = null;
      }

      setCollectionConfig({
        id: newCollectionId.toString(),
        name: watchFormFields.name,
        description: watchFormFields.description,
        file: collectionFile,
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
                  {...register("name", { required: "Collection name is required" })}
                />
                <Input
                  isRequired
                  label="Collection Description"
                  placeholder="The description of your new collection"
                  type="text"
                  {...register("description", { required: "Collection description is required" })}
                />

                <div className="text-xs flex flex-col overflow-auto px-3">
                <label>Collection Image (max 1MB):</label>
                  <input
                    type="file"
                    accept={rewardsConfig.acceptedNftFormats.join(",")}
                    className="mt-0 pb-2"
                    {...register(`imageFile`)}
                    onChange={(e) => {
                      const file = e.target.files ? e.target.files[0] : null;
                      if (file) {
                        // Check if the file size exceeds 1MB
                        if (file.size > 1048576) { // 1MB in bytes
                          setError(`imageFile`, {
                            type: "size",
                            message: "Cover image size should not exceed 1MB"
                          });
                        } else {
                          clearErrors(`imageFile`);
                        }
                      } else {
                        // Handle case where no file is selected
                        clearErrors(`imageFile`);
                      }
                    }}

                  />
                  {/* @ts-ignore */}
                  {errors?.imageFile && (
                    <span className="w-full text-tiny text-danger px-1">
                      {/* @ts-ignore */}
                      <>{errors?.imageFile.message}</>
                    </span>
                  )}
                </div>

              </form>
              {errors && Object.keys(errors).length > 0 && (
                <span className="text-danger text-lg text-center w-full">
                  There are input errors, please see above.
                </span>
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
                disabled={!isValid}
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
