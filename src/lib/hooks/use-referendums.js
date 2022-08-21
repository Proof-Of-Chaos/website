import useSWR from "swr";
import { referendumData } from "../../data/vote-data";
import { ApiPromise, WsProvider } from '@polkadot/api';
import { ApolloClient, InMemoryCache, gql as agql } from '@apollo/client';
import { request, gql } from "graphql-request";
import {websiteConfig} from "../../data/website-config";
import { useQuery } from "@tanstack/react-query";
import useAppStore from "../../zustand";

const BLOCK_DURATION = 6000;  

export const referendumFetcher = async (ksmAddress) => {
  const wsProvider = new WsProvider('wss://kusama-rpc.polkadot.io');
  const api = await ApiPromise.create({ provider: wsProvider });

  const { hash, number } = await api.rpc.chain.getHeader();
  const timestamp = await api.query.timestamp.now.at(hash);

  const activeReferendums = await api.derive.democracy.referendums()

  let referendums = [];
  for (const referendum of activeReferendums) {
    const endDate = await getEndDateByBlock(referendum.status.end, number, timestamp)
    const PAData = await getPADataForRef(referendum.index.toString());
    referendums.push(referendumObject(referendum, endDate, PAData, ksmAddress));
  }

  return referendums.sort((a,b)=>parseInt(b.id)-parseInt(a.id));
};

const getEndDateByBlock = (blockNumber, currentBlockNumber, currentTimestamp) => {
  let newStamp = parseInt(currentTimestamp.toString()) + ((parseInt(blockNumber.toString()) - currentBlockNumber.toNumber()) * BLOCK_DURATION)
  return new Date(newStamp);
}

async function getPADataForRef(referendumID) {
  return new Promise( async ( resolve ) => {
    const client = new ApolloClient({
      uri: websiteConfig.polkassembly_graphql_endpoint,
      cache: new InMemoryCache(),
    })

    let result = await client.query({
      operationName: "ReferendumPostAndComments",
      query: agql` 
        query ReferendumPostAndComments($id: Int!) {
          posts(where: {onchain_link: {onchain_referendum_id: {_eq: $id}}}) {
            ...referendumPost
          }
        }

        fragment referendumPost on posts {
          content
          created_at
          title
        }
    `,
      variables: {
        "id": referendumID
      }
    })

    resolve(result?.data?.posts[0])
  })
}

const microToKSM = (microKSM) => {
  return parseInt(microKSM) / 1000000000000;
}

const microToKSMFormatted = (microKSM) => {
  return parseFloat((microToKSM(microKSM) / 1000).toFixed(2)) + 'K KSM';
}

const parseCastVote = (vote) => {
  if (!vote) {
    return null
  }

  return {
    aye: vote.vote.isAye,
    balance: parseInt(vote.balance.toString()) / 1000000000000,
    conviction: vote.vote.conviction.toString(),
  }
}

const referendumObject = (referendum, endDate, PAData, ksmAddress) => {
  let title = PAData?.title

  if (!title) {
    title = referendum.image.proposal.section.toString() + '.' + referendum.image.proposal.method.toString()
  }

  const vote = referendum.votes.find((account) => {
    return account.accountId.toString() === ksmAddress;
  })

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
    description: PAData?.content   ?? "-",
    castVote: parseCastVote(vote),
  }
}

export const useReferendums = ( config ) => {
  const ksmAddress = useAppStore( (state) => state.user.connectedAccount?.ksmAddress )
  const { data, mutate, error } = useSWR( 'referendumData', referendumFetcher(ksmAddress) )
  const loading = !data && !error;

  return useQuery(
    [ "referendumData", ksmAddress ],
    async () => {
      return referendumFetcher(ksmAddress)
    },
    config
  )

  return {
    loading,
    referendumData: data,
    mutate,
    error,
  };
};

export const useUserNfts = () => {
  const ksmAddress = useAppStore( (state) => state.user.connectedAccount?.ksmAddress )
  return useQuery(["userNFTs", ksmAddress ], async () => {
    const data = await fetchNFTsForUser( ksmAddress );
    return data.nfts
  })
}
