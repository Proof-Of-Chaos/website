"use client";

import { useAppStore } from "@/app/zustand";
import { UIReferendum } from "../types";
import { formatBalance } from "@polkadot/util";
import { Card } from "@nextui-org/card";
import { DecoratedConvictionVote } from "@/types";
import { ConvictionDelegation } from "../../../../types/index";
import { InlineLoader } from "@/components/inline-loader";
import { extractNumberFromConviction } from "../util";
import Identicon from "@polkadot/react-identicon";
import { trimAddress } from "@/components/util";
import { Link } from "@nextui-org/link";
import { usePolkadotApis } from "@/context/polkadot-api-context";

export function ReferendumUserInfoCard({
  referendum,
  isUserVotesLoading,
  userVote,
  userDelegation,
}: {
  referendum: UIReferendum;
  isUserVotesLoading?: boolean;
  userVote?: DecoratedConvictionVote;
  userDelegation?: ConvictionDelegation;
}) {
  const { activeChainInfo } = usePolkadotApis();
  const { decimals, symbol } = activeChainInfo;

  const formatToChainDecimals = (value: number | string) => {
    const rawBalance = formatBalance(value, {
      decimals,
      withSi: false,
      withSiFull: false,
    });

    return `${parseFloat(rawBalance).toFixed(2)} ${symbol}`;
  };

  const userVoted =
    !userVote && !userDelegation
      ? "none"
      : userVote && !userDelegation
      ? "vote"
      : "delegation";

  userVote?.voteDirection === "splitAbstain" ? "split" : "single";

  let decision = userVote?.voteDirection;
  let balance = userVote?.balance;

  let lockPeriod = extractNumberFromConviction(userVote?.conviction);

  return (
    <Card
      radius="sm"
      className="p-4 mb-2 text-sm bg-gray-100 dark:bg-slate-800"
      shadow="sm"
    >
      {isUserVotesLoading ? (
        <div className="flex-col w-full text-center">
          Loading your vote
          <InlineLoader />
        </div>
      ) : (
        <>
          {userVoted === "none" && (
            <>
              You have not voted on <br />
              referendum {referendum?.index} yet <br />
              <div className="flex gap-4 text-2xl justify-center">
                <span>↓</span>
                <span>↓</span>
                <span>↓</span>
              </div>
            </>
          )}
          {userVoted === "delegation" && (
            <>
              You have delegated your vote to{" "}
              <div className="flex justify-center items-center">
                <Link
                  isExternal
                  href={`https://kusama.subscan.io/account/${userDelegation?.target}`}
                  className="text-foreground hover:underline text-tiny border-1 border-foreground rounded-md p-1 m-1"
                >
                  <Identicon
                    value={userDelegation?.target}
                    size={19}
                    theme="polkadot"
                    className="hover:cursor-pointer inline mr-2"
                  />
                  {userDelegation?.target && (
                    <>{trimAddress(userDelegation?.target)}</>
                  )}
                </Link>
              </div>
            </>
          )}
          {userVoted === "vote" && (
            <div className="flex-col w-full text-center">
              <div className="">
                <span>You voted</span>
                <b>
                  {decision === "yes" ||
                    (decision === "Aye" && (
                      <span className="bg-green-400 text-black px-2 rounded-sm mx-1">
                        Aye
                      </span>
                    ))}
                  {decision === "no" && (
                    <span className="bg-red-400 px-2 rounded-sm mx-1">Nay</span>
                  )}
                  {decision === "split" && (
                    <>
                      <span className="bg-green-400 text-black px-2 rounded-sm mx-1">
                        Aye
                      </span>
                      +
                      <span className="bg-red-400 px-2 rounded-sm mx-1">
                        Nay
                      </span>
                    </>
                  )}
                  {decision === "splitAbstain" && (
                    <>
                      <span className="bg-green-400 text-black px-2 rounded-sm mx-1">
                        Aye
                      </span>
                      +
                      <span className="bg-red-400 px-2 rounded-sm mx-1">
                        Nay
                      </span>
                      +
                      <span className="bg-gray-400 px-2 rounded-sm mx-1">
                        Abstain
                      </span>
                    </>
                  )}
                </b>
              </div>
              {decision !== "split" && decision !== "splitAbstain" && (
                <>
                  <div className="">
                    <span>
                      with <b>{formatToChainDecimals(balance?.aye ?? 0)}</b>
                    </span>
                  </div>
                  <div className="">
                    <span>
                      and conviction <b>{lockPeriod}</b>
                    </span>
                  </div>
                </>
              )}
              {decision === "split" && (
                <div className="">
                  <span>
                    with <b>{formatToChainDecimals(balance?.aye ?? 0)}</b> +{" "}
                    <b>{formatToChainDecimals(balance?.nay ?? 0)}</b>
                  </span>
                </div>
              )}
              {decision === "splitAbstain" && (
                <div className="">
                  <span>
                    with <b>{formatToChainDecimals(balance?.aye ?? 0)}</b> +{" "}
                    <b>{formatToChainDecimals(balance?.nay ?? 0)}</b> +{" "}
                    <b>{formatToChainDecimals(balance?.abstain ?? 0)} </b>
                  </span>
                </div>
              )}
            </div>
          )}
          {/* <div>
            user vote:
            <pre className="text-tiny">{JSON.stringify(userVote, null, 2)}</pre>
            user delegation:
            <pre className="text-tiny">
              {JSON.stringify(userDelegation, null, 2)}
            </pre>
          </div> */}
        </>
      )}
    </Card>
  );
}
