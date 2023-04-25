import { useRef, useState } from "react";
import { VoteChoice, useVoteManager } from "../../../hooks/use-vote-manager";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import Button from "../button";
import classNames from "classnames";
import { Slider } from "@mui/material";
import { castVote } from "../../../data/vote-service";
import { useModal } from "../../modals/context";
import { microToKSM } from "../../../utils";
import useAccountBalance from "../../../hooks/use-account-balance";
import { InlineLoader } from "../loader";
import useAppStore from "../../../zustand";
import { useLatestUserVoteForRef } from "../../../hooks/use-votes";
import { useQueryClient } from "@tanstack/react-query";
import PinataFileUpload from "./pinata-file-upload";

function RewardsCreationRarityFields({ rarity, controlledValues }) {
  const { register } = useFormContext();

  return (
    <div className={`flex flex-col w-1/3 p-5 m-2 form-fields-${rarity}`}>
      <h3 className="text-xl">{rarity}</h3>
      <label
        htmlFor={`file-${rarity}`}
        className="mt-4 form-label block text-sm font-bold tracking-wider text-gray-900 dark:text-white"
      >
        Upload Image
      </label>
      <PinataFileUpload />

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
        {...register(`options.${rarity}.name`, {
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
        {...register(`options.${rarity}.description`, {
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
        {...register(`options.${rarity}.artist`, {
          validate: {},
        })}
      />
    </div>
  );
}

export function RewardsCreationForm() {
  const formMethods = useForm();

  const {
    register,
    getValues,
    handleSubmit,
    watch,
    formState: { errors },
  } = formMethods;

  const { closeModal } = useModal();

  const watchFormFields = watch();

  const [rewardFields, setRewardFields] = useState({
    refIndex: undefined,
    royaltyAddress: undefined,
    options: [
      { rarity: 'common', name: '', description: '', artist: '' },
      { rarity: 'rare', name: '', description: '', artist: '' },
      { rarity: 'epic', name: '', description: '', artist: '' },
    ],
  });

  async function onSubmit( data ) {
    console.table( data )
    closeModal();
  }

  // const totalAyeVotes = ! isNaN( parseFloat( watchAyeVoteAmount ) ) ?
  //   voteChoice === VoteChoice.Aye ?
  //     (parseFloat(sliderValue.value) * parseFloat(watchAyeVoteAmount)).toFixed(2).replace(/[.,]00$/, "") :
  //       parseFloat(watchAyeVoteAmount).toFixed(2).replace(/[.,]00$/, "") :
  //         '-'

  // const totalNayVotes = ! isNaN( parseFloat( watchNayVoteAmount ) ) ?
  //   voteChoice === VoteChoice.Nay ?
  //     (parseFloat(sliderValue.value) * parseFloat(watchNayVoteAmount)).toFixed(2).replace(/[.,]00$/, "") :
  //       parseFloat(watchNayVoteAmount).toFixed(2).replace(/[.,]00$/, "") :
  //         '-'

  // const totalAbstainVotes = ! isNaN( parseFloat( watchAbstainVoteAmount ) ) ?
  //   (parseFloat(watchAbstainVoteAmount)).toFixed(2).replace(/[.,]00$/, "") :
  //       '-'

  return (
    <div className="w-full">
      <FormProvider {...formMethods} >
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
            htmlFor="royaltyAddress"
            className="mt-4 form-label block text-sm font-bold tracking-wider text-gray-900 dark:text-white"
          >
            NFTs
          </label>
          <div className="flex flex-row w-full">
            {["common", "rare", "epic"].map((rarity, index) => {
              const fields = rewardFields.options[index];
              return <RewardsCreationRarityFields rarity={rarity} fields={ fields }/>;
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
      <pre className="text-[0.5rem]">
        {JSON.stringify(watchFormFields, null, 2)}
      </pre>
    </div>
  );
}
