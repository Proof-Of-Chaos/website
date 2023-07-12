import type { Option } from "@polkadot/types";
import type {
  PalletConvictionVotingVoteCasting,
  PalletConvictionVotingVoteVoting,
  PalletReferendaReferendumInfoConvictionVotingTally,
} from "@polkadot/types/lookup";
import { BN } from "@polkadot/util";
import type {
  Lock,
  PalletReferenda,
  PalletVote,
  ConvictionVote,
  VoteConviction,
} from "../types.js";
import { ApiDecoration } from "@polkadot/api/types";
import { getApiAt } from "../tools/substrateUtils";

// Helper function to get vote parameters
const getVoteParams = (
  accountId: string,
  lockClasses?: BN[]
): [[accountId: string, classId: BN][]] | undefined => {
  if (lockClasses) {
    return [lockClasses.map((classId) => [accountId, classId])];
  }
  return undefined;
};

// Helper function to get referendum parameters
const getRefParams = (
  votes?: [
    classId: BN,
    refIds: BN[],
    casting: PalletConvictionVotingVoteCasting
  ][]
): [BN[]] | undefined => {
  if (votes && votes.length) {
    const refIds = votes.reduce<BN[]>(
      (all, [, refIds]) => all.concat(refIds),
      []
    );
    if (refIds.length) {
      return [refIds];
    }
  }
  return undefined;
};

/**
 * Retrieve account locks for the given votes and endBlock.
 * @param votes Array of ConvictionVote objects.
 * @param endBlock The block number to calculate locked balances.
 * @returns Array of VoteWithLock objects containing lockedWithConviction property.
 */
export const retrieveAccountLocks = async (
  votes: ConvictionVote[],
  endBlock: number
): Promise<VoteConviction[]> => {
  const api = await getApiAt("kusama", endBlock);
  const LOCKS = [1, 10, 20, 30, 40, 50, 60];
  const LOCKPERIODS = [0, 1, 2, 4, 8, 16, 32];
  const sevenDaysBlocks = api.consts.convictionVoting.voteLockingPeriod;

  const endBlockBN = new BN(endBlock);
  const promises = votes.map(async (vote) => {
    const userVotes = await useAccountLocksImpl(
      api,
      "referenda",
      "convictionVoting",
      vote.address.toString()
    );

    const userLockedBalancesWithConviction = userVotes
      .filter(
        (userVote) =>
          userVote.endBlock.sub(endBlockBN).gte(new BN(0)) ||
          userVote.endBlock.eqn(0)
      )
      .map((userVote) => {
        const lockPeriods = userVote.endBlock.eqn(0)
          ? 0
          : Math.floor(
              userVote.endBlock
                .sub(endBlockBN)
                .muln(10)
                .div(sevenDaysBlocks)
                .toNumber() / 10
            );
        const matchingPeriod = LOCKPERIODS.reduce(
          (acc, curr, index) => (lockPeriods >= curr ? index : acc),
          0
        );
        return userVote.total.muln(LOCKS[matchingPeriod]).div(new BN(10));
      });

    const maxLockedWithConviction =
      userLockedBalancesWithConviction.length > 0
        ? userLockedBalancesWithConviction.reduce((max, current) =>
            BN.max(max, current)
          )
        : new BN(0);

    return { ...vote, lockedWithConviction: maxLockedWithConviction };
  });

  return await Promise.all(promises);
};

// Helper function to get locks
const getLocks = (
  api: ApiDecoration<"promise">,
  palletVote: PalletVote,
  votes: [
    classId: BN,
    refIds: BN[],
    casting: PalletConvictionVotingVoteCasting
  ][],
  referenda: [BN, PalletReferendaReferendumInfoConvictionVotingTally][]
): Lock[] => {
  const lockPeriod = api.consts[palletVote].voteLockingPeriod as BN;
  const locks: Lock[] = [];

  votes.forEach(([classId, , casting]) => {
    casting.votes.forEach(([refId, accountVote]) => {
      const refInfo = referenda.find(([id]) => id.eq(refId));

      if (refInfo) {
        const [, tally] = refInfo;
        let total: BN | undefined;
        let endBlock: BN | undefined;
        let conviction = 0;
        let locked = "None";

        // Process account vote based on its type
        if (accountVote.isStandard) {
          const { balance, vote } = accountVote.asStandard;
          total = balance;
          if (
            (tally.isApproved && vote.isAye) ||
            (tally.isRejected && vote.isNay)
          ) {
            conviction = vote.conviction.index;
            locked = vote.conviction.type;
          }
        } else if (accountVote.isSplit) {
          const { aye, nay } = accountVote.asSplit;
          total = aye.add(nay);
        } else if (accountVote.isSplitAbstain) {
          const { abstain, aye, nay } = accountVote.asSplitAbstain;
          total = aye.add(nay).add(abstain);
        } else {
          console.error(`Unable to handle ${accountVote.type}`);
        }

        // Calculate end block based on tally type
        if (tally.isOngoing) {
          endBlock = new BN(0);
        } else if (tally.isKilled) {
          endBlock = tally.asKilled;
        } else if (tally.isCancelled || tally.isTimedOut) {
          endBlock = tally.isCancelled
            ? tally.asCancelled[0]
            : tally.asTimedOut[0];
        } else if (tally.isApproved || tally.isRejected) {
          endBlock = lockPeriod
            .muln(conviction)
            .add(tally.isApproved ? tally.asApproved[0] : tally.asRejected[0]);
        } else {
          console.error(`Unable to handle ${tally.type}`);
        }

        if (total && endBlock) {
          locks.push({ classId, endBlock, locked, refId, total });
        }
      }
    });
  });

  return locks;
};

// Main function to get account locks
export async function useAccountLocksImpl(
  api: ApiDecoration<"promise">,
  palletReferenda: PalletReferenda,
  palletVote: PalletVote,
  accountId: string
): Promise<Lock[]> {
  const locks: [BN, BN][] = await api.query.convictionVoting?.classLocksFor(
    accountId
  );
  const lockClassesFormatted: BN[] = locks.map(([classId]) => classId);
  const voteParams: [[string, BN][]] = getVoteParams(
    accountId,
    lockClassesFormatted
  );
  let [params]: [[string, BN][]] = voteParams;
  const votes: PalletConvictionVotingVoteVoting[] =
    await api.query.convictionVoting?.votingFor.multi(params);
  const votesFormatted = votes
    .map((v, index): null | [BN, BN[], PalletConvictionVotingVoteCasting] => {
      if (!v.isCasting) {
        return null;
      }

      const casting = v.asCasting;

      return [params[index][1], casting.votes.map(([refId]) => refId), casting];
    })
    .filter((v): v is [BN, BN[], PalletConvictionVotingVoteCasting] => !!v);

  if (votesFormatted.length === 0) {
    return [];
  }
  const refParams: [BN[]] = getRefParams(votesFormatted);
  if (!refParams) {
    return [];
  }

  const [paramsref]: [BN[]] = refParams;
  const optTally: Option<PalletReferendaReferendumInfoConvictionVotingTally>[] =
    await api.query.referenda?.referendumInfoFor.multi(paramsref);

  const referendaFormatted = optTally
    .map(
      (
        v,
        index
      ): null | [BN, PalletReferendaReferendumInfoConvictionVotingTally] =>
        v.isSome ? [paramsref[index], v.unwrap()] : null
    )
    .filter(
      (v): v is [BN, PalletReferendaReferendumInfoConvictionVotingTally] => !!v
    );

  // Combine the referenda outcomes and the votes into locks
  return getLocks(api, palletVote, votesFormatted, referendaFormatted);
}
