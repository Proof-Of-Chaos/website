import { useState } from "react";
import { useForm, FormProvider, useFormContext } from "react-hook-form";

import { useModal } from "../../modals/context";

import axios from "axios";
import Button from "../button";
import { testConfig } from "../../../pages/referendum-rewards";
const JWT = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJmYmJjN2JlMi03YTYyLTRmYWMtODcwYy0xZWU5ZDcwMDcwNjYiLCJlbWFpbCI6Im5pa2xhc0BlZWRlZS5uZXQiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJpZCI6IkZSQTEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX0seyJpZCI6Ik5ZQzEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiODQ3NjAwODllNzA3MzYyMmRmODUiLCJzY29wZWRLZXlTZWNyZXQiOiI4NjIzYTk2ODUyZTcwNGU4NjdlNDlhNmEwNTJmYmFiMTY0Y2YzNmVlYzY1Y2Y2ODBmOGIwNmU4MjNiZDFmM2ZhIiwiaWF0IjoxNjgyNDEwMzk5fQ.1T4KBu1kRQas5xm8Q8Jop1Z3O7TJHRyDhOUT7ZG_M4Y`;

function RewardsCreationRarityFields({ rarity, controlledValues }) {
  const { register } = useFormContext();

  let optionIndex;
  switch (rarity) {
    case "epic":
      optionIndex = 0;
      break;
    case "rare":
      optionIndex = 1;
      break;
    case "common":
      optionIndex = 2;
      break;
    default:
      optionIndex = 2;
  }

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
        {...register(`options[${optionIndex}].name`, {
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
  const formMethods = useForm();

  const [callData, setCallData] = useState();
  const [isCallDataLoading, setIsCallDataLoading] = useState(false);
  const [error, setError] = useState();

  const {
    watch,
    formState: { errors },
  } = formMethods;

  const { closeModal } = useModal();

  const watchFormFields = watch();

  // {
  //   "maxProbability": 40,
  //   "minProbability": 10,
  //   "transferable": 1,
  //   "symbol": "R99",
  //   "text": "'Rare'\n\nI voted on Ref 99 and got a rare NFT",
  //   "artist": "Dali",
  //   "creativeDirector": "Amadeus Mozart",
  //   "main": "99/rare/main.png",
  //   "thumb": "99/rare/thumb.png",
  //   "rarity": "rare",
  //   "itemName": "Rare",
  //   "minRoyalty": 20,
  //   "maxRoyalty": 30,
  //   "metadataCidDirect": "ipfs://ipfs/bafkreia45czi7tm73kumnrreakggj7b6owywexuhhen4jiv4dyoc3tvx7u",
  //   "metadataCidDelegated": "ipfs://ipfs/bafkreia45czi7tm73kumnrreakggj7b6owywexuhhen4jiv4dyoc3tvx7u"
  // },

  const [rewardFields, setRewardFields] = useState({
    refIndex: undefined,
    royaltyAddress: undefined,
    options: [
      {
        rarity: "common",
        name: "",
        description: "",
        artist: "",
        file: undefined,
      },
      {
        rarity: "rare",
        name: "",
        description: "",
        artist: "",
        file: undefined,
      },
      {
        rarity: "epic",
        name: "",
        description: "",
        artist: "",
        file: undefined,
      },
    ],
  });

  async function pinFile(file) {
    console.log("rewardFields", rewardFields);
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const metadata = JSON.stringify({
      name: file.name,
    });
    formData.append("pinataMetadata", metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append("pinataOptions", options);

    try {
      const res = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          maxBodyLength: "Infinity",
          headers: {
            "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
            Authorization: JWT,
          },
        }
      );
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  }

  async function pinAllFiles() {
    const file_common = watchFormFields.options.common.file?.[0];
    const file_rare = watchFormFields.options.rare.file?.[0];
    const file_epic = watchFormFields.options.epic.file?.[0];

    return await Promise.all([
      pinFile(file_common),
      pinFile(file_rare),
      pinFile(file_epic),
    ]);
  }

  async function generatePreimage() {
    const config = {
      ...testConfig,
      ...watchFormFields,
      options: testConfig.options.map((option, index) => {
        return {
          ...option,
          ...watchFormFields.options[index],
        };
      }),
    };

    setIsCallDataLoading(true);

    try {
      setError();
      const res = await fetch("/api/create-rewards-calls", {
        method: "POST",
        body: JSON.stringify(config),
      });

      console.log("res", res);
      let jsonRes = await res.json();
      console.log("jsonRes", jsonRes);

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
    // pinAllFiles();
    generatePreimage();
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
              const fields = rewardFields.options[index];
              return (
                <RewardsCreationRarityFields
                  key={rarity}
                  rarity={rarity}
                  fields={fields}
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
        <div>
          Generating your calls, please stand by this may take a while...
        </div>
      )}
      {error && (
        <div>
          <p>Error generating your calls, please try again.</p>
          <p className="text-red-500">{error.message}</p>
        </div>
      )}
      call config:
      <pre className="text-[0.5rem]">
        {JSON.stringify(callData?.config, null, 2)}
      </pre>
      preimage hex:
      <pre className="text-[0.5rem]">
        {JSON.stringify(callData?.preimage, null, 2)}
      </pre>
      <pre className="text-[0.5rem]">
        form fields: {JSON.stringify(watchFormFields, null, 2)}
      </pre>
    </div>
  );
}
