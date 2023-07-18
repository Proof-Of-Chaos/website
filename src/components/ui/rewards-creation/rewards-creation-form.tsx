import { useState } from "react";
import { useForm, FormProvider, useFormContext } from "react-hook-form";

import Button from "../button";
import Loader from "../loader";
import { defaultReferendumRewardsConfig } from "../../../data/default-referendum-rewards-config";
import useAppStore from "../../../zustand";

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

  const [callData, setCallData] = useState({
    config: {},
    preimage: null,
    step: null,
    fees: null,
    distribution: {},
    txsCount: null,
  });
  const [isCallDataLoading, setIsCallDataLoading] = useState(false);
  const [error, setError] = useState({
    message: "",
    name: "",
  });

  const formMethods = useForm({
    defaultValues: defaultReferendumRewardsConfig,
  });

  const {
    watch,
    formState: { errors },
  } = formMethods;

  const watchFormFields = watch();

  //TODO type
  async function generatePreimage(formData) {
    console.log("my Form data is", formData);
    if (!walletAddress) {
      setError({
        message: "Please connect your wallet to continue.",
        name: "Wallet not connected",
      });
      return;
    }

    setIsCallDataLoading(true);

    try {
      setError({ message: "", name: "" });

      const res = await fetch("/api/create-rewards-calls", {
        method: "POST",
        body: formData,
      });

      console.log("result from api ", res);
      const jsonRes = await res.json();

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

  async function onSubmit(data) {
    console.table(data);

    // we use form data because we are also transmitting files
    const formData = new URLSearchParams({
      data: JSON.stringify({
        ...data,
        sender: walletAddress,
      }),
    });

    // that are appended to the form data in respective key value pairs
    // e.g. commonFile => FileObject
    data.options.forEach((option) => {
      formData.append(`${option.rarity}File`, option.file[0]);
    });

    generatePreimage(formData);
  }

  return (
    <div className="w-full">
      <FormProvider {...formMethods}>
        <form
          onSubmit={formMethods.handleSubmit(onSubmit)}
          className="my-5 mx-1 flex flex-col"
        >
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

          <label
            htmlFor="royaltyAddress"
            className="mt-4 form-label block text-sm font-bold tracking-wider text-gray-900 dark:text-white"
          >
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

          <Button type="submit" variant="primary" className="w-full mt-4">
            Submit Referendum Rewards
          </Button>
        </form>
      </FormProvider>
      {isCallDataLoading && (
        <div className="text-center">
          <Loader className="w-12 h-12" text="" />
          <p>
            Generating all required transactions to distribute the rewards to
            all voters of the selected referendum,
          </p>
          <p>please stand by this may take a while...</p>
        </div>
      )}
      {error.message !== "" && (
        <div>
          <p>Error generating your calls, please try again.</p>
          <p className="text-red-500">{error.message}</p>
        </div>
      )}
      {callData && (
        <div>
          <p>{JSON.stringify(callData.distribution)} will be sendout</p>
          <p>Fees for your call: ~{JSON.stringify(callData.fees)}</p>
          <p>Transaction Count: {JSON.stringify(callData.txsCount)}</p>
        </div>
      )}
      <pre className="text-[0.5rem]">
        file: {JSON.stringify(watchFormFields.options[0]?.file?.[0], null, 2)}
        form fields: {JSON.stringify(watchFormFields, null, 2)}
      </pre>
      <pre className="text-[0.5rem]">
        call config:
        {JSON.stringify(callData?.config, null, 2)}
      </pre>
      {/* <pre className="text-[0.5rem] break-spaces">
        preimage hex:
        {callData?.preimage}
      </pre> */}
    </div>
  );
}
