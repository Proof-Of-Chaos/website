import { useState } from "react";
import { useForm, FormProvider, useFormContext } from "react-hook-form";

import Button from "../button";
import Loader from "../loader";
import { defaultReferendumRewardsConfig } from "../../../data/default-referendum-rewards-config";
import useAppStore from "../../../zustand";

import style from "./rewards-creation-form.module.scss";
import { GenerateRewardsResult } from "../../../pages/api/nft_sendout_script/types";
import {
  WS_ENDPOINTS_ASSET_HUB_KUSAMA,
  WS_ENDPOINTS_STATEMINE,
  getApi,
  sendAndFinalize,
} from "../../../data/chain";
import { getWalletBySource } from "@talismn/connect-wallets";

function RewardsCreationRarityFields({ rarity, refConfig }) {
  const { register } = useFormContext();

  let optionIndex = refConfig.options.findIndex((opt) => opt.rarity === rarity);

  return (
    <div className={`flex flex-col p-5 form-fields-${rarity}`}>
      <h3 className="text-xl">{rarity}</h3>
      <label
        htmlFor={`file-${rarity}`}
        className="mt-4 form-label block text-sm font-bold tracking-wider text-gray-900 dark:text-white"
      >
        Upload Image
      </label>

      <input
        type="file"
        {...register(`options[${optionIndex}].file`, {
          validate: {},
        })}
        required
      />

      <label
        htmlFor={`name-${rarity}`}
        className="mt-4 form-label block text-sm font-bold tracking-wider text-gray-900 dark:text-white"
      >
        Name of {rarity} NFT
      </label>
      <input
        id={`name-${rarity}`}
        className="form-control mt-2 block h-10 w-full rounded-md border border-gray-200 bg-white px-4 text-sm placeholder-gray-400  transition-shadow duration-200 invalid:border-red-500 invalid:text-red-600 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:invalid:border-red-500 focus:invalid:ring-red-500 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-700 dark:bg-light-dark dark:text-gray-100 dark:focus:border-gray-600 dark:focus:ring-gray-600 sm:rounded-lg"
        placeholder={`Enter name of ${rarity} NFT`}
        type="text"
        {...register(`options[${optionIndex}].itemName`, {
          validate: {},
        })}
      />

      <label
        htmlFor={`description-${rarity}`}
        className="mt-4 form-label block text-sm font-bold tracking-wider text-gray-900 dark:text-white"
      >
        Description of {rarity} NFT
      </label>
      <input
        id={`description-${rarity}`}
        className="form-control mt-2 block h-10 w-full rounded-md border border-gray-200 bg-white px-4 text-sm placeholder-gray-400  transition-shadow duration-200 invalid:border-red-500 invalid:text-red-600 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:invalid:border-red-500 focus:invalid:ring-red-500 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-700 dark:bg-light-dark dark:text-gray-100 dark:focus:border-gray-600 dark:focus:ring-gray-600 sm:rounded-lg"
        placeholder={`Enter name of ${rarity} NFT`}
        type="text"
        {...register(`options[${optionIndex}].description`, {
          validate: {},
        })}
      />

      <label
        htmlFor={`artist-${rarity}`}
        className="mt-4 form-label block text-sm font-bold tracking-wider text-gray-900 dark:text-white"
      >
        Artist of {rarity} NFT
      </label>
      <input
        id={`artist-${rarity}`}
        className="form-control mt-2 block h-10 w-full rounded-md border border-gray-200 bg-white px-4 text-sm placeholder-gray-400  transition-shadow duration-200 invalid:border-red-500 invalid:text-red-600 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:invalid:border-red-500 focus:invalid:ring-red-500 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-700 dark:bg-light-dark dark:text-gray-100 dark:focus:border-gray-600 dark:focus:ring-gray-600 sm:rounded-lg"
        placeholder={`Enter name of ${rarity} NFT`}
        type="text"
        {...register(`options[${optionIndex}].artist`, {
          validate: {},
        })}
      />
    </div>
  );
}

export function RewardsCreationForm() {
  const connectedAccountIndex = useAppStore(
    (state) => state.user.connectedAccount
  );
  const connectedAccount = useAppStore(
    (state) => state.user.connectedAccounts?.[connectedAccountIndex]
  );
  const walletAddress = connectedAccount?.address;
  const wallet = getWalletBySource(connectedAccount?.source);

  const [callData, setCallData] = useState<GenerateRewardsResult>();
  const [isCallDataLoading, setIsCallDataLoading] = useState(false);
  const [error, setError] = useState({
    message: "",
    name: "",
  });
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);

  const formMethods = useForm({
    defaultValues: defaultReferendumRewardsConfig,
  });

  const {
    watch,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = formMethods;

  const watchFormFields = watch();

  //TODO type
  async function generatePreimage(formData) {
    console.log("Form data is", JSON.stringify(formData, null, 2));
    if (!walletAddress) {
      setError({
        message: "Please connect your wallet to continue.",
        name: "Wallet not connected",
      });
      return;
    }

    setIsCallDataLoading(true);
    setIsOverlayVisible(true);

    try {
      setError({ message: "", name: "" });

      const res = await fetch("/api/create-rewards-calls", {
        method: "POST",
        body: formData,
      });

      const jsonRes = await res.json();
      console.log("result from api ", jsonRes);

      if (jsonRes.name === "Error") {
        console.log(" frontend", jsonRes);
        setError(jsonRes);
        setIsCallDataLoading(false);
      }

      setCallData(jsonRes);
      setIsCallDataLoading(false);
    } catch (error) {
      console.log(" frontend", error);
      setError(error);
      setIsCallDataLoading(false);
    }
  }

  async function signAndSend() {
    await wallet.enable("Proof of Chaos");
    const signer = wallet.signer;

    const apiStatemine = await getApi(WS_ENDPOINTS_ASSET_HUB_KUSAMA);

    const tx = apiStatemine.tx.system.remark(
      "Created with https://www.proofofchaos.app/referendum-rewards/"
    );

    console.log("aaa", signer, walletAddress, tx, callData.statemineTxs);

    apiStatemine.tx.system
      .remark("Created with https://www.proofofchaos.app/referendum-rewards/")
      .signAndSend(walletAddress, { signer: wallet.signer }, ({ status }) => {
        if (status.isReady) {
        } else if (status.isInBlock) {
          console.log(
            `Completed at block hash #${status.asInBlock.toString()}`
          );
        } else if (status.isFinalized) {
          console.log(`Current status: ${status.type}`);
        } else {
          console.log(`Current status: ${status.type}`);
        }
      })
      .catch((error) => {
        console.log(":( transaction failed", error);
      });

    // apiStatemine.tx.utility
    //   .batchAll(callData.statemineTxs)
    //   .signAndSend(walletAddress, { signer: wallet.signer }, ({ status }) => {
    //     if (status.isReady) {
    //     } else if (status.isInBlock) {
    //       console.log(
    //         `Completed at block hash #${status.asInBlock.toString()}`
    //       );
    //     } else if (status.isFinalized) {
    //       console.log(`Current status: ${status.type}`);
    //     } else {
    //       console.log(`Current status: ${status.type}`);
    //     }
    //   })
    //   .catch((error) => {
    //     console.log(":( transaction failed", error);
    //   });

    // sendAndFinalize(
    // callData.statemineTxs,
    // apiStatemine.tx.system.remark(
    //   "Created with https://www.proofofchaos.app/referendum-rewards/"
    // ),
    //   walletAddress,
    //   signer,
    //   WS_ENDPOINTS_STATEMINE
    // );
  }

  async function onSubmit(data) {
    console.table(data);

    setCallData(undefined);

    // we use form data because we are also transmitting files
    const formData = new FormData();

    formData.append(
      "data",
      JSON.stringify({
        ...data,
        sender: walletAddress,
      })
    );

    // that are appended to the form data in respective key value pairs
    // e.g. commonFile => FileObject
    data.options.forEach((option) => {
      formData.append(`${option.rarity}File`, option.file[0], "somename.jpg");
    });

    generatePreimage(formData);
  }

  return (
    <div className={style.formWrapper}>
      <FormProvider {...formMethods}>
        <form
          onSubmit={formMethods.handleSubmit(onSubmit)}
          className={style.form}
        >
          <h1 className="text-2xl">Create Rewards for a Referendum</h1>
          <p className="text-xs">
            Here you can create a signable transactions for sending out NFTs to
            users who voted on a referendum.
          </p>
          <p className="text-xs">Just fill in the form and click submit.</p>
          <label
            htmlFor="refIndex"
            className="mt-4 form-label block text-sm font-bold tracking-wider text-gray-900 dark:text-white"
          >
            Referendum Index
          </label>
          <select
            className="form-control mt-2 block h-10 w-full rounded-md border border-gray-200 bg-white px-4 text-sm placeholder-gray-400  transition-shadow duration-200 invalid:border-red-500 invalid:text-red-600 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:invalid:border-red-500 focus:invalid:ring-red-500 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-700 dark:bg-light-dark dark:text-gray-100 dark:focus:border-gray-600 dark:focus:ring-gray-600 sm:rounded-lg"
            {...formMethods.register("refIndex", {
              validate: {},
            })}
          >
            <option value="99">99</option>
            <option value="201">201</option>
            <option value="200">200</option>
            <option value="199">199</option>
            <option value="198">198</option>
          </select>

          <label
            htmlFor="royaltyAddress"
            className="mt-4 form-label block text-sm font-bold tracking-wider text-gray-900 dark:text-white"
          >
            Royalty Address
          </label>
          <input
            className="form-control mt-2 block h-10 w-full rounded-md border border-gray-200 bg-white px-4 text-sm placeholder-gray-400  transition-shadow duration-200 invalid:border-red-500 invalid:text-red-600 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:invalid:border-red-500 focus:invalid:ring-red-500 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-700 dark:bg-light-dark dark:text-gray-100 dark:focus:border-gray-600 dark:focus:ring-gray-600 sm:rounded-lg"
            placeholder="0"
            type="text"
            {...formMethods.register("royaltyAddress", {
              validate: {},
            })}
            required
          />

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
            {...formMethods.register("newCollectionName", {
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
            {...formMethods.register("newCollectionDescription", {
              validate: {},
            })}
          />

          <label className="mt-4 form-label block text-sm font-bold tracking-wider text-gray-900 dark:text-white">
            NFTs
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-4 w-full">
            {["common", "rare", "epic"].map((rarity, index) => {
              // const fields = watchFormFields.options[index];
              return (
                <RewardsCreationRarityFields
                  key={rarity}
                  rarity={rarity}
                  refConfig={watchFormFields}
                />
              );
            })}
          </div>

          {errors["refIndex"] &&
            errors["refIndex"].type === "positiveNumber" && (
              <p className="form-error">
                Your vote amount must be a positive number
              </p>
            )}
          {errors["refIndex"] &&
            errors["refIndex"].type === "hasEnoughFunds" && (
              <p className="form-error">You do not have enough available KSM</p>
            )}

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-4"
            disabled={isCallDataLoading}
          >
            Submit Referendum Rewards
          </Button>
        </form>
      </FormProvider>
      {isOverlayVisible && (
        <div className={style.overlay}>
          {isCallDataLoading && (
            <>
              <Loader className="w-12 h-12" text="" />
              <p className="text-xs"></p>
              <ul className="text-xs">
                <li>
                  - Creating a new collection with the name and description
                  provided
                </li>
                <li>- Pinning your images and NFT metadata to IPFS</li>
                <li>
                  - Generating all required transactions to distribute the
                  rewards to all voters of the selected referendum
                </li>
              </ul>
              <p className="text-xs mt-5">
                Please stand by this may take a while...
              </p>
            </>
          )}
          {!isCallDataLoading && callData && (
            <>
              <h3 className="text-lg">
                🛠️ Your transactions were successfully created ⛓️
              </h3>
              {error.message !== "" && (
                <div>
                  <p>Error generating your calls, please try again.</p>
                  <p className="text-red-500">{error.message}</p>
                </div>
              )}
              {callData && (
                <div className="text-sm">
                  <p>
                    NFTs to send out:&nbsp;
                    {JSON.stringify(callData.distribution)}
                  </p>
                  <p>
                    Estimated fees for your transactions:&nbsp;
                    {JSON.stringify(callData.fees)}
                  </p>
                  <p>Transaction Count: {JSON.stringify(callData.txsCount)}</p>
                </div>
              )}
              <div className="button-wrap pt-5">
                <Button
                  className="mr-4"
                  onClick={() => setIsOverlayVisible(false)}
                  variant="cancel"
                >
                  Cancel
                </Button>
                <Button onClick={signAndSend} variant="primary">
                  Sign and Send
                </Button>
              </div>
            </>
          )}
        </div>
      )}
      {/* <pre className="text-[0.5rem]">
        file: {JSON.stringify(watchFormFields.options[0]?.file?.[0], null, 2)}
        form fields: {JSON.stringify(watchFormFields, null, 2)}
      </pre> */}
      {/* <pre className="text-[0.5rem]">
        call config:
        {JSON.stringify(callData?.config, null, 2)}
      </pre> */}
      {/* <pre className="text-[0.5rem] break-spaces">
        preimage hex:
        {callData?.preimage}
      </pre> */}
    </div>
  );
}
