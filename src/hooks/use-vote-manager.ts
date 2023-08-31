import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useAppStore from "../zustand";
import { getWalletBySource } from "@talismn/connect-wallets";
import { getVoteTx } from "../data/vote-service";
import { getApi, getApiKusama } from "../data/chain";
import toast from "react-hot-toast";

export const VoteState = {
  AwaitingSignature: "AwaitingSignature",
  Ready: "Ready",
  InBlock: "InBlock",
  Finalized: "Finalized",
  None: "None",
};

export const VoteChoice = {
  Aye: "Aye",
  Nay: "Nay",
  Split: "Split",
  Abstain: "Abstain",
};

export function useVoteManager(queryClient = null) {
  /**
   * Stores the vote state of the votes for each referendum
   */

  const refsBeingVoted = useAppStore((state) => state.user.voteStates);
  const updateVoteState = useAppStore((state) => state.updateVoteState);
  const removeVoteState = useAppStore((state) => state.removeVoteState);
  const connectedAccountIndex = useAppStore(
    (state) => state.user.connectedAccount
  );
  const connectedAccount = useAppStore(
    (state) => state.user.connectedAccounts?.[connectedAccountIndex]
  );
  const userAddress = connectedAccount?.ksmAddress;

  const wallet = getWalletBySource(connectedAccount?.source);

  const optimisticUpdateVotes = async (
    voteChoice,
    voteBalances,
    conviction,
    refId
  ) => {
    if (queryClient) {
      const updateCacheKey = ["votes", userAddress, true];

      await queryClient.cancelQueries({ queryKey: updateCacheKey });

      const voteIndexerFormatted = {
        balance:
          voteChoice === VoteChoice.Aye
            ? { value: `${voteBalances.aye}` }
            : voteChoice === VoteChoice.Nay
            ? { value: `${voteBalances.nay}` }
            : voteChoice === VoteChoice.Split
            ? "split"
            : "abstain",
        decision:
          voteChoice === VoteChoice.Aye
            ? "aye"
            : voteChoice === VoteChoice.Nay
            ? "nay"
            : voteChoice === VoteChoice.Split
            ? "split"
            : "abstain",
        lockPeriod: conviction,
        referendumIndex: refId,
        voter: userAddress,
      };

      queryClient.setQueryData(["votes"], (votes) => {
        Object.assign(
          votes ?? {},
          votes?.map((el) =>
            el.referendumIndex === refId ? voteIndexerFormatted : el
          )
        );
      });

      queryClient.invalidateQueries({
        queryKey: updateCacheKey,
        refetchType: "all",
      });
    }
  };

  const voteOnRef = async (refId, voteChoice, balances, conviction = 1.0) => {
    await wallet?.enable("Proof of Chaos");
    const api = await getApiKusama();

    const voteBalances = {
      aye: balances["vote-amount-aye"] * 1000000000000,
      nay: balances["vote-amount-nay"] * 1000000000000,
      abstain: balances["vote-amount-abstain"] * 1000000000000,
    };

    const voteExtrinsic = getVoteTx(
      api,
      voteChoice,
      refId,
      voteBalances,
      conviction < 1 ? 0 : conviction,
      true //gov2
    );

    const vote = {
      voteChoice,
      balances: voteBalances,
      conviction: conviction < 1 ? 0 : conviction,
      state: VoteState.AwaitingSignature,
    };

    updateVoteState(refId, vote);
    const toastId = toast.loading(`(1/3) Awaiting your signature`, {
      //@ts-ignore
      title: `Vote on Referendum ${refId}`,
      className: "toaster",
    });

    voteExtrinsic
      .signAndSend(
        connectedAccount.address,
        { signer: wallet.signer },
        ({ status }) => {
          if (status.isReady) {
            updateVoteState(refId, { ...vote, state: VoteState.Ready });
            toast.loading(`(2/3) Waiting for transaction to enter block`, {
              id: toastId,
            });
          } else if (status.isInBlock) {
            console.log(
              `Completed at block hash #${status.asInBlock.toString()}`
            );
            updateVoteState(refId, { ...vote, state: VoteState.InBlock });
            toast.loading(`(3/3) Waiting for block finalization`, {
              id: toastId,
            });
          } else if (status.isFinalized) {
            // console.log(`Current status: ${status.type}`)
            toast.success("Vote successfully recorded 🗳️", {
              id: toastId,
              duration: 4000,
            });
            removeVoteState(refId);
            optimisticUpdateVotes(voteChoice, voteBalances, conviction, refId);
          } else {
            // console.log(`Current status: ${status.type}`)
          }
        }
      )
      .catch((error) => {
        // console.log(":( transaction failed", error)
        removeVoteState(refId);
        toast.dismiss(toastId);
      });
  };

  return { refsBeingVoted, voteOnRef };
}
