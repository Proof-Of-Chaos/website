import { Dialog } from "@headlessui/react";
import Button from "../ui/button";
import Input from "../ui/input";
import { useModal } from "./context";
import { toast } from "react-toastify";
import useAppStore from "../../zustand";
import { submitQuizAnswers } from "../../data/quiz-service";
import { getWalletBySource } from "@talismn/connect-wallets";
import { watch } from "fs";
import { FormProvider, useForm } from "react-hook-form";
import { useState } from "react";
import { getApiKusamaAssetHub, sendAndFinalize } from "../../data/chain";

export default function CreateNFTCollectionModal({ config, sender }) {
  const { openModal, closeModal } = useModal();

  const connectedAccountIndex = useAppStore(
    (state) => state.user.connectedAccount
  );
  const connectedAccount = useAppStore(
    (state) => state.user.connectedAccounts?.[connectedAccountIndex]
  );

  const formMethods = useForm({
    defaultValues: {
      collectionName: "",
      collectionDescription: "",
      imageFile: null,
    },
  });

  const {
    watch,
    register,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = formMethods;

  const [data, setData] = useState(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({
    message: "",
    name: "",
  });

  const watchFormFields = watch();

  const onSubmit = async (data) => {
    console.table(data);

    const formData = new FormData();

    formData.append(
      "data",
      JSON.stringify({
        collectionName: data.collectionName,
        collectionDescription: data.collectionDescription,
        sender,
      })
    );

    formData.append("imageFile", data.imageFile[0]);

    console.log("hello");

    const res = await fetch("/api/create-new-collection/", {
      method: "POST",
      body: formData,
    });
    const { tx, name, message } = await res.json();
    if (name === "Error") {
      console.log(" frontend error", name, message);
      setError({ name, message });
    }

    console.log("result from api ", tx);

    const signResults = await signTx(tx);

    console.log("signResults", signResults);

    setIsLoading(false);
    setData(tx);
  };

  async function signTx(tx) {
    const walletAddress = connectedAccount?.address;
    const wallet = getWalletBySource(connectedAccount?.source);
    await wallet.enable("Proof of Chaos");
    const signer = wallet.signer;

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
      walletAddress
    );

    return signatureRes;
  }

  return (
    <div className="overflow-scroll">
      <Dialog.Title as="h3" className="text-xl font-medium text-gray-900">
        Create a new NFT collection on Kusama Asset Hub
      </Dialog.Title>

      <Dialog.Panel>
        <FormProvider {...formMethods}>
          <form className="p-1" onSubmit={formMethods.handleSubmit(onSubmit)}>
            <label
              htmlFor="newCollectionName"
              className="mt-4 form-label block text-sm font-bold tracking-wider text-gray-900 dark:text-white"
            >
              Collection Name
            </label>
            <input
              className="form-control mt-2 block h-10 w-full rounded-md border border-gray-200 bg-white px-4 text-sm placeholder-gray-400  transition-shadow duration-200 invalid:border-red-500 invalid:text-red-600 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:invalid:border-red-500 focus:invalid:ring-red-500 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-700 dark:bg-light-dark dark:text-gray-100 dark:focus:border-gray-600 dark:focus:ring-gray-600 sm:rounded-lg"
              placeholder="The name of your new collection"
              type="text"
              {...register("collectionName", {
                validate: {},
              })}
            />

            <label
              htmlFor="newCollectionName"
              className="mt-4 form-label block text-sm font-bold tracking-wider text-gray-900 dark:text-white"
            >
              Collection Description
            </label>
            <input
              className="form-control mt-2 block h-10 w-full rounded-md border border-gray-200 bg-white px-4 text-sm placeholder-gray-400  transition-shadow duration-200 invalid:border-red-500 invalid:text-red-600 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:invalid:border-red-500 focus:invalid:ring-red-500 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-700 dark:bg-light-dark dark:text-gray-100 dark:focus:border-gray-600 dark:focus:ring-gray-600 sm:rounded-lg"
              placeholder="The description of your new collection"
              type="text"
              {...register("collectionDescription", {
                validate: {},
              })}
            />

            <label
              htmlFor={`imageFile`}
              className="mt-4 form-label block text-sm font-bold tracking-wider text-gray-900 dark:text-white"
            >
              Collection Image
            </label>
            <input
              type="file"
              {...register(`imageFile`, {
                validate: {},
              })}
              required
            />
            <Button type="submit" variant="primary" className="w-full mt-4">
              Create Collection
            </Button>
            {error.message && (
              <div className="text-red-500">{error.message}</div>
            )}
          </form>
        </FormProvider>
        <pre className="text-[0.5rem]">
          {JSON.stringify(watchFormFields, null, 2)}
        </pre>
      </Dialog.Panel>
    </div>
  );
}
