import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Slider, SliderTypeMap } from "@mui/material";
import { useAccountBalance } from "@/hooks/use-account-balance";
import { Button, ButtonGroup } from "@nextui-org/button";
import { VoteChoice } from "../vote/types";
import clsx from "clsx";
import { formatBalance, bnToBn, BN_ZERO } from "@polkadot/util";

import { Input } from "@nextui-org/input";
import { getDelegateTX, getVoteTx } from "../vote/util";
import { sendAndFinalize } from "@/components/util-client";

import { vividButtonClasses } from "@/components/primitives";

import { InlineLoader } from "@/components/inline-loader";
import { usePolkadotApis } from "@/context/polkadot-api-context";
import { usePolkadotExtension } from "@/context/polkadot-extension-context";
import { siteConfig } from "@/config/site";

const VOTE_LOCK_OPTIONS = [
  {
    value: 0.1,
    label: "No lockup",
  },
  {
    value: 1,
    label: "Locked for 1 enactment period (8 days)",
  },
  {
    value: 2,
    label: "Locked for 2 enactment periods (16 days)",
  },
  {
    value: 3,
    label: "Locked for 4 enactment periods (32 days)",
  },
  {
    value: 4,
    label: "Locked for 8 enactment periods (64 days)",
  },
  {
    value: 5,
    label: "Locked for 16 enactment periods (128 days)",
  },
  {
    value: 6,
    label: "Locked for 32 enactment periods (256 days)",
  },
];

const marks = [
  {
    value: 0,
    label: "0.1x",
  },
  {
    value: 1,
    label: "1x",
  },
  {
    value: 2,
    label: "2x",
  },
  {
    value: 3,
    label: "3x",
  },
  {
    value: 4,
    label: "4x",
  },
  {
    value: 5,
    label: "5x",
  },
  {
    value: 6,
    label: "6x",
  },
];

export function DelegateForm() {
  const hasUserSubmittedAnswers = false;
  const latestUserVote = null;

  const [isVoteLoading, setIsVoteLoading] = useState<boolean>(false);
  const [voteChoice, setVoteChoice] = useState(VoteChoice.Aye);
  const [sliderValue, setSliderValue] = useState(VOTE_LOCK_OPTIONS[1]);
  const sliderRef = useRef<any>(undefined);
  const { activeChainInfo, apiStates } = usePolkadotApis();
  const relay = apiStates?.relay;
  const { decimals, symbol } = activeChainInfo;
  const voteInChainDecimalsMultiplier = bnToBn(10).pow(bnToBn(decimals));
  const { selectedAccount, getSigner } = usePolkadotExtension();

  const { data: accountBalance, isLoading: isBalanceLoading } =
    useAccountBalance();
  const availableBalanceRaw = accountBalance?.data?.free;
  const availableBalance = formatBalance(availableBalanceRaw, {
    decimals,
    withSi: true,
    withUnit: symbol,
    forceUnit: "-",
  });

  const voteAmountLabel = (
    <>
      <span className="text-xs font-normal flex items-center">
        available balance:{" "}
        {isBalanceLoading ? (
          <InlineLoader className="ml-2" />
        ) : (
          `${availableBalance}`
        )}
      </span>
    </>
  );

  function sliderValueText(value: any) {
    return `${value} KSM`;
  }

  async function onSubmit() {
    const conviction = sliderValue.value;
    const delegateBalance = bnToBn(watchDelegateBalance.toString()).mul(
      voteInChainDecimalsMultiplier
    );

    console.log("yo", {
      delegator: siteConfig.delegator,
      conviction,
      balance: bnToBn(watchDelegateBalance.toString()),
    });

    const delegateExtrinsic = getDelegateTX(
      relay?.api,
      0,
      siteConfig.delegator,
      conviction,
      bnToBn(watchDelegateBalance.toString())
    );

    const accountSigner = await getSigner();
    if (!accountSigner) {
      console.error("No signer found");
      return;
    }

    setIsVoteLoading(true);
    await sendAndFinalize(
      relay?.api,
      delegateExtrinsic,
      accountSigner,
      selectedAccount?.address,
      {
        title: `Delegating to Proof of Chaos`,
      }
    );
    setIsVoteLoading(false);

    // closeModal();
  }

  const handleSliderChange = (e: any) => {
    setSliderValue(VOTE_LOCK_OPTIONS[e.target.value]);
  };

  function valuetext(value: any) {
    return `${value}°C`;
  }

  function valueLabelFormat(value: any) {
    return marks[Math.floor(value)]?.label;
  }

  //   const voteAmountLabel = isBalanceLoading ? "Loading Balance ..." : "Balance";

  const {
    register,
    getValues,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      "delegate-balance": 1,
    },
  });

  const watchDelegateBalance = watch<"delegate-balance">("delegate-balance", 1);

  const totalDelegation = !isNaN(watchDelegateBalance)
    ? (parseFloat(sliderValue.value.toString()) * watchDelegateBalance)
        .toFixed(2)
        .replace(/[.,]00$/, "")
    : parseFloat(watchDelegateBalance.toString())
        ?.toFixed(2)
        .replace(/[.,]00$/, "");

  return (
    <div>
      {hasUserSubmittedAnswers && (
        <div className="bg-emerald-600 text-white p-3 mt-4 rounded-lg text-sm">
          Thanks for answering those questions, your answers were successfully
          recorded. If you answered correctly, you will have a higher chance of
          receiving rare and epic Items for this Referendum.
        </div>
      )}
      {latestUserVote && (
        <div className="bg-amber-300 p-3 rounded-lg text-sm mt-3 mx-1">
          You already voted on this referendum. Voting again will replace your
          current vote.
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="my-5 mx-1">
        <Input
          isRequired
          className="mt-3"
          label="Delegate Amount"
          placeholder="0"
          description={voteAmountLabel}
          type="number"
          min={0}
          step={0.01}
          {...register("delegate-balance", {
            validate: {
              positiveNumber: (value) => value >= 0.0,
              hasEnoughFunds: (value) =>
                availableBalanceRaw &&
                bnToBn(value)
                  .mul(voteInChainDecimalsMultiplier)
                  .lte(bnToBn(availableBalanceRaw)),
            },
          })}
        />

        <>
          <label
            htmlFor="conviction-slider"
            className={clsx(
              "mt-4 form-label block text-sm font-bold tracking-wider text-gray-900 dark:text-white",
              {
                hidden: [VoteChoice.Split, VoteChoice.Abstain].includes(
                  voteChoice
                ),
              }
            )}
          >
            Conviction
          </label>
          <div className="mx-3">
            <Slider
              aria-label="Conviction Slider"
              id="conviction-slider"
              className={clsx("conviction-slider")}
              defaultValue={1}
              min={0}
              max={6}
              marks={marks}
              value={sliderValue.value}
              valueLabelDisplay="auto"
              valueLabelFormat={valueLabelFormat}
              getAriaValueText={valuetext}
              onChange={handleSliderChange}
              ref={sliderRef}
            />
          </div>
          {sliderValue.value !== 0 && (
            <p className="text-xs text-foreground-400">{sliderValue.label}</p>
          )}
        </>

        <div className="mt-4 text-sm justify-around items-center rounded-lg form-status border-2 border-gray-500 p-3 px-4 flex flex-row">
          <span className="">Total Votes Delegating</span>
          <div className="text-right">
            <p>
              {[VoteChoice.Aye, VoteChoice.Split, VoteChoice.Abstain].includes(
                voteChoice
              ) && (
                <>
                  <span className="font-bold">{totalDelegation}</span> Aye Votes
                </>
              )}
            </p>
          </div>
        </div>
        <Button
          type="submit"
          className={clsx("w-full mt-4 h-16", vividButtonClasses)}
          radius="sm"
          isLoading={isVoteLoading}
        >
          Delegate to Proof of Chaos
        </Button>
      </form>
    </div>
  );
}
