import { Dialog } from "@headlessui/react";
import { useModal } from "./context";
import { toast } from "react-toastify";
import useAppStore from "../../zustand";
import { submitQuizAnswers } from "../../data/quiz-service";
import { getWalletBySource } from "@talismn/connect-wallets";
import { watch } from "fs";
import { FormProvider, useForm } from "react-hook-form";
import { useState } from "react";
import {
  defaultToastMessages,
  getApiKusamaAssetHub,
  sendAndFinalize,
} from "../../data/chain";
import { SendAndFinalizeResult } from "../../pages/api/nft_sendout_script/types";
import LoadingComponent from "../ui/loadingComponent";
import {
  ModalBody,
  ModalFooter,
  ModalHeader,
  Button,
  Input,
} from "@nextui-org/react";
import { websiteConfig } from "../../data/website-config";

export default function CreateNFTCollectionModal({
  config,
  sender,
  setCollectionConfig,
  setIsNewCollectionLoading,
}) {
  const { openModal, closeModal } = useModal();

  const connectedAccountIndex = useAppStore(
    (state) => state.user.connectedAccount
  );
  const connectedAccount = useAppStore(
    (state) => state.user.connectedAccounts?.[connectedAccountIndex]
  );

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

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({
    message: "",
    name: "",
  });

  const watchFormFields = watch();

  const onCancel = () => {
    setCollectionConfig({
      file: watchFormFields.imageFile,
      isNew: false,
    });

    closeModal();
  };

  const onSubmit = async (data) => {
    console.table(data);

    const formData = new FormData();

    formData.append(
      "data",
      JSON.stringify({
        collectionName: data.collectionName,
        description: data.description,
        sender,
      })
    );

    formData.append("imageFile", data.imageFile?.[0]);

    setIsLoading(true);
    //sets in parent form
    setIsNewCollectionLoading(true);

    const res = await fetch("/api/create-new-collection/", {
      method: "POST",
      body: formData,
    });
    const { tx, name, message } = await res.json();

    console.info(`result from create-new-collection:`, {
      tx,
      name,
      message,
    });

    if (name === "Error") {
      setError({ name, message });
    }

    try {
      const { status, events, blockHeader } = await signTx(tx);

      console.log("status of create collection", {
        status,
        events,
        blockHeader,
      });

      if (status === "success") {
        const newCollectionIdEvent = events.find(
          (e) => e.event.section === "nfts" && e.event.method === "Created"
        );

        const newCollectionId = newCollectionIdEvent?.event?.data[0];

        setCollectionConfig({
          id: newCollectionId.toPrimitive(),
          name: data.name,
          description: data.description,
          file: data.imageFile,
          isNew: true,
        });

        closeModal();
      }
    } catch (error) {
      console.log("error signing transaction", error);
      setError({
        name: "Error",
        message: `Error signing transaction: ${error}`,
      });
    }

    setIsLoading(false);
    setIsNewCollectionLoading(false);
  };

  async function signTx(tx): Promise<SendAndFinalizeResult> {
    const walletAddress = connectedAccount?.address;
    const wallet = getWalletBySource(connectedAccount?.source);
    await wallet?.enable("Proof of Chaos");
    const signer = wallet?.signer;

    if (!walletAddress) {
      setError({
        message: "Please connect your wallet to continue.",
        name: "Wallet not connected",
      });
      return;
    }

    const apiKusamaAssetHub = await getApiKusamaAssetHub();

    const signatureRes = await sendAndFinalize(
      apiKusamaAssetHub,
      tx,
      signer,
      walletAddress,
      {
        title: "Creating NFT collection",
        messages: defaultToastMessages,
      }
    );

    return signatureRes;
  }

  return (
    <div className="">
      <ModalHeader className="flex flex-col gap-1">
        Create a new NFT collection on Kusama Asset Hub
      </ModalHeader>

      <ModalBody>
        <p className="form-helper">
          Sending the form will create a new collection on Kusama Asset Hub. The
          metadata of the collection (image, name, description) will be set in
          the next step when your rewards transactions are signed.
        </p>

        <LoadingComponent
          isLoading={isLoading}
          loaderText="Creating new NFT collection"
        >
          <FormProvider {...formMethods}>
            <form
              className="flex w-full flex-wrap gap-4"
              onSubmit={formMethods.handleSubmit(onSubmit)}
            >
              <Input
                isRequired
                label="Collection Name"
                placeholder="The name of your new collection"
                type="text"
                {...register("name", {
                  validate: {},
                })}
              />
              <Input
                isRequired
                label="Collection Description"
                placeholder="The description of your new collection"
                type="text"
                {...register("description", {
                  validate: {},
                })}
              />

              <div>
                <label
                  htmlFor={`imageFile`}
                  className="block font-medium text-foreground-600 text-tiny cursor-text will-change-auto origin-top-left transition-all !duration-200 !ease-out motion-reduce:transition-none mb-0 pb-0"
                >
                  Collection Image (max 3MB)
                </label>
                <input
                  required
                  accept={websiteConfig.accepted_nft_formats.join(",")}
                  type="file"
                  name="imageFile"
                  {...register(`imageFile`, {
                    validate: {
                      noFile: (files) =>
                        files?.length > 0 || "Please upload a file",
                      lessThan3MB: (files) => {
                        return files[0].size < 3 * 1024 * 1024 || "Max 3MB";
                      },
                      acceptedFormats: (files) =>
                        websiteConfig.accepted_nft_formats.includes(
                          files[0]?.type
                        ) || "please upload a valid image or video file",
                    },
                  })}
                />
              </div>
              {errors.imageFile && (
                <span className="w-full text-sm text-red-500">
                  <>{errors.imageFile.message}</>
                </span>
              )}
            </form>
          </FormProvider>
        </LoadingComponent>
        {error.message && (
          <div className="text-red-500 text-sm">{error.message}</div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button
          onClick={formMethods.handleSubmit(onSubmit)}
          color="secondary"
          className="w-full"
        >
          Create Collection
        </Button>
        <Button type="button" onClick={onCancel} className="w-full">
          Cancel
        </Button>
      </ModalFooter>

      {/* <pre className="text-[0.5rem]">
        {JSON.stringify(watchFormFields, null, 2)}
      </pre> */}
    </div>
  );
}
