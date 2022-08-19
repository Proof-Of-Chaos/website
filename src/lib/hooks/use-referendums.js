import useSWR from "swr";
import { referendumData } from "../../data/vote-data";
import { ApiPromise, WsProvider } from '@polkadot/api';

const BLOCK_DURATION = 6000;

export const referendumFetcher = async () => {
  const wsProvider = new WsProvider('wss://kusama-rpc.polkadot.io');
  const api = await ApiPromise.create({ provider: wsProvider });

  const { hash, number } = await api.rpc.chain.getHeader();
  const timestamp = await api.query.timestamp.now.at(hash);

  const activeReferendums = await api.derive.democracy.referendums()

  let referendums = [];
  activeReferendums.forEach((referendum) => {
    let endDate = getEndDateByBlock(referendum.status.end, number, timestamp)
    referendums.push(referendumObject(referendum, endDate));
  })

  return referendums;
};

const getEndDateByBlock = (blockNumber, currentBlockNumber, currentTimestamp) => {
  let newStamp = parseInt(currentTimestamp.toString()) + ((parseInt(blockNumber.toString()) - currentBlockNumber.toNumber()) * BLOCK_DURATION)
  return new Date(newStamp);
}

const microToKSM = (microKSM) => {
  return parseInt(microKSM) / 1000000000000;
}

const microToKSMFormatted = (microKSM) => {
  return parseFloat((microToKSM(microKSM) / 1000).toFixed(2)) + 'K KSM';
}

const referendumObject = (referendum, endDate) => {
  const title = referendum.image.proposal.section.toString() + '.' + referendum.image.proposal.method.toString()

  return {
    id: referendum.index.toString(),
      title: title,
      voteVolume: microToKSM(referendum.votedTotal.toString()),
      aye: {
        vote: referendum.voteCountAye,
          percentage: Math.round(referendum.voteCountAye / referendum.voteCount * 100),
          voteVolume: microToKSMFormatted(referendum.votedAye.toString()),
      },
      nay: {
        vote: referendum.voteCountNay,
          percentage: Math.round(referendum.voteCountNay / referendum.voteCount * 100),
          voteVolume: microToKSMFormatted(referendum.votedNay.toString()),
      },
      executed_at: endDate,
        proposed_by: {
        id: referendum.image.proposer.toString(),
        link: '#',
    },
    status: 'active',
    votes: [],
    actions: [],
    description: "-",
  }
}

export const useReferendums = () => {
  const { data, mutate, error } = useSWR( 'referendumData', referendumFetcher )
  const loading = !data && !error;

  return {
    loading,
    referendumData: data,
    mutate,
    error,
  };
};
