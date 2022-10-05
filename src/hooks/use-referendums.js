import { ApiPromise, WsProvider } from '@polkadot/api';
import { ApolloClient, InMemoryCache, gql as agql } from '@apollo/client';
import {websiteConfig} from "../data/website-config";
import { useQuery } from "@tanstack/react-query";
import useAppStore from "../zustand";
import { microToKSM, microToKSMFormatted, getEndDateByBlock } from "../utils";
import { getApi } from '../data/chain';
import { getQuizDataForRef } from './use-quizzes';

const BLOCK_DURATION = 6000;
const THRESHOLD_SUPERMAJORITYAPPROVE = 'SuperMajorityApprove'
const THRESHOLD_SUPERMAJORITYAGAINST = 'SuperMajorityAgainst'
const THRESHOLD_SIMPLEMAJORITY = 'SimpleMajority'

const convictionMultiplierMapping = {
  'None': 0.1,
  'Locked1x': 1,
  'Locked2x': 2,
  'Locked3x': 3,
  'Locked4x': 4,
  'Locked5x': 5,
  'Locked6x': 6,
}

<<<<<<< HEAD
export const referendumFetcher = async (ksmAddress) => {
  const api = await getApi();
=======
export const pastReferendumFetcher = async (ksmAddress) => {
  const wsProvider = new WsProvider('wss://kusama-rpc.polkadot.io');
  const api = await ApiPromise.create({ provider: wsProvider });

  const { hash, number } = await api.rpc.chain.getHeader();
  const timestamp = await api.query.timestamp.now.at(hash);
  const totalIssuance = await api.query.balances.totalIssuance().toString()
  const pastReferendums = [226,227,228]

  let referendums = [];
  for (const referendum of pastReferendums) {

    // const endDate = await getEndDateByBlock(referendum.status.end, number, timestamp)
    const PAData = await getPADataForRef(referendum);
    // const threshold = getPassingThreshold(referendum, totalIssuance)
    referendums.push(PAData);
  }

  return referendums.sort((a,b)=>parseInt(a.id)-parseInt(b.id));
};

export const activeReferendumFetcher = async (ksmAddress) => {
  const wsProvider = new WsProvider('wss://kusama-rpc.polkadot.io');
  const api = await ApiPromise.create({ provider: wsProvider });
>>>>>>> wip - not finished

  const { hash, number } = await api.rpc.chain.getHeader();

  const timestamp = await api.query.timestamp.now.at(hash);
  const totalIssuance = await api.query.balances.totalIssuance().toString()
  const activeReferendums = await api.derive.democracy.referendums()
  let referendums = [];
  for (const referendum of activeReferendums) {
    /* DOODLE LOOKING AT TRESHOLD / finding proposals (probably requires Subsquid API)
    console.log(referendum.imageHash.toString());
    const info = await api.query.democracy.referendumInfoOf(referendum.index)
    console.log(info.toHuman())
    const proposalhash = info.unwrap().asOngoing.proposalHash
    console.log(proposalhash.toString())
    let props = await api.query.democracy.preimages.entries()
    //console.log(props)
    props.forEach(([_, maybePreImage]) => {
      let perImage = maybePreImage.unwrapOrDefault();
      console.log(perImage.asAvailable.data.toString())
    })*/
    //const info = await api.query.democracy.referendumInfoOf(referendum.index)
    //const proposalhash = info.unwrap().asOngoing.proposalHash
    //console.log("!",referendum.imageHash.toString())

    const endDate = await getEndDateByBlock(referendum.status.end, number, timestamp)
    const PAData = await getPADataForRef(referendum.index.toString());
    const quizData = await getQuizDataForRef(referendum.index.toString());
    const threshold = getPassingThreshold(referendum, totalIssuance)
    referendums.push(referendumObject(referendum, threshold, endDate, PAData, quizData.quizzes, ksmAddress));
  }

  return referendums.sort((a,b)=>parseInt(a.id)-parseInt(b.id));
};

const getPassingThreshold = (referendum, totalIssuance) => {
  return true; /* TODO: incorporate treshold formulas */
  switch (referendum.status.threshold.toString()) {
    case THRESHOLD_SUPERMAJORITYAPPROVE:
      break;
    case THRESHOLD_SIMPLEMAJORITY:
    default:
      return parseInt(referendum.votedTotal.toString()) / 2
  }
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

const toPercentage = (part, whole) => {
  return Math.round(parseInt(part) / parseInt(whole) * 100)
}

const parseCastVote = (vote) => {
  if (!vote) {
    return null
  }

  return {
    aye: vote.vote?.isAye,
    balance: parseInt(vote.balance?.toString()) / 1000000000000,
    conviction: vote.vote?.conviction?.toString(),
  }
}

const referendumObject = (referendum, threshold, endDate, PAData, quizData, ksmAddress) => {
  let title = PAData?.title

  if (!title && referendum.image) {
    title = referendum.image.proposal.section.toString() + '.' + referendum.image.proposal.method.toString()
  }
  //getlatestversion
  let latestQuiz = quizData.sort((a,b)=>parseInt(b.version)-parseInt(a.version))[0]
  let allSubmissions = []
  //write submissions from all versions together in one array
  quizData.forEach(quizVersion => {
    allSubmissions.push(...quizVersion.submissions)
  });
  /* DOODLE LOOKING AT CONVICTION
  let ayeTotal = 0;
  let nayTotal = 0;
  referendum.votes.forEach((vote) => {
    const balance = parseInt(vote.vote?.conviction?.toString())
    const convictionMultiplier = convictionMultiplierMapping[vote.vote?.conviction?.toString()]
    const votePower = balance * convictionMultiplier
    if (vote.vote?.isAye) {
      ayeTotal += votePower
    } else {
      nayTotal += votePower
    }
  });
  console.log(ayeTotal, nayTotal)*/
  const votedTotal = parseInt(referendum.votedAye.toString()) + parseInt(referendum.votedNay.toString())

  return {
    id: referendum.index.toString(),
    title: title,
    voteVolume: microToKSM(referendum.votedTotal.toString()),
    aye: {
      vote: referendum.voteCountAye,
      percentage: toPercentage(referendum.votedAye.toString(), votedTotal),
      voteVolume: microToKSMFormatted(referendum.votedAye.toString()),
    },
    nay: {
      vote: referendum.voteCountNay,
      percentage: toPercentage(referendum.votedNay.toString(), votedTotal),
      voteVolume: microToKSMFormatted(referendum.votedNay.toString()),
    },
    executed_at: endDate,
    proposed_by: {
      id: referendum.image?.proposer?.toString() ?? '-',
      link: '#',
    },
    status: 'active',
    votes: referendum.votes,
    description: PAData?.content ?? "-",
    isPassing: referendum.isPassing,
    threshold: threshold,
    quiz: latestQuiz,
    submissions: allSubmissions
  }
}

/**
 * Return a dependent query, that depends on the ksmAdress (user) and the fetched referendums
 * @param {*} referendumId
 * @returns Promise
 */
export function useAccountVote( referendumId ) {
  const connectedAccountIndex = useAppStore( (state) => state.user.connectedAccount )
  const ksmAddress = useAppStore( (state) => state.user.connectedAccounts?.[connectedAccountIndex]?.ksmAddress )
  const { data:referendums } = useReferendums()
  return useQuery( ['userVote', ksmAddress, referendumId ], async () => {
    const referendum = referendums.find( ( ref ) => ref.id === referendumId )
    const userVote = referendum && referendum?.votes?.find((vote) => {
      return vote.accountId.toString() === ksmAddress;
    })
    return userVote ? parseCastVote( userVote ) : false
  }, {
    enabled: !!referendums
  })
}

export const useReferendums = ( config ) => {
  const cachedReferendums = useAppStore((state)=>state.referendums)
  const ksmAddress = useAppStore( (state) => state.user.connectedAccount?.ksmAddress )

  return useQuery(
    [ "referendumData", ksmAddress ],
    async () => {
      return activeReferendumFetcher(ksmAddress)
    },
    { placeholderData: cachedReferendums },
  )
};

export const usePastReferendums = ( ) => {
  return useQuery(
    [ "pastReferendumData" ],
    async () => {
      return pastReferendumFetcher()
    },
  )
};

export const useUserNfts = () => {
  const ksmAddress = useAppStore( (state) => state.user.connectedAccount?.ksmAddress )
  return useQuery(["userNFTs", ksmAddress ], async () => {
    const data = await fetchNFTsForUser( ksmAddress );
    return data.nfts
  })
}
