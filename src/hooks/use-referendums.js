import { ApolloClient, InMemoryCache, gql as agql } from '@apollo/client';
import { useQuery } from "@tanstack/react-query";

import { websiteConfig } from "../data/website-config";
import { microToKSM,  getEndDateByBlock } from "../utils";
import { getApi } from '../data/chain';
import { useLatestQuizForRef, useGov1Quizzes, fetchGov1Quizzes } from './use-quizzes';
import { QUERY_REFERENDUMS } from "./queries";

const THRESHOLD_SUPERMAJORITYAPPROVE = 'SuperMajorityApprove'
const THRESHOLD_SUPERMAJORITYAGAINST = 'SuperMajorityAgainst'
const THRESHOLD_SIMPLEMAJORITY = 'SimpleMajority'

export const singleReferendumFetcher = async ( referendumIndex ) => {
  return new Promise( async(resolve) => {
    const client = new ApolloClient({
      uri: websiteConfig.proofofchaos_graphql_endpoint,
      cache: new InMemoryCache(),
    })

    if ( referendumIndex === null || isNaN( referendumIndex ) ) {
      resolve([])
    } else {
      let result = await client.query({
        query: QUERY_REFERENDUMS,
        variables: {
          "where": {
            "index_eq": referendumIndex
          },
        }
      })

      const polkassemblyData = await getPADataForRefs( [ referendumIndex ] );
      const quizData = await useLatestQuizForRef(referendumIndex, false);
      let latestQuiz = {}

      if ( quizData?.quizzes?.length > 0) {
        latestQuiz = quizData.quizzes.sort((a,b)=>parseInt(b.version)-parseInt(a.version))[0]
      }

      resolve( {
        ...result.data.referendaStats.find( el => el.index === referendumIndex ),
        title: polkassemblyData[0]?.title,
        description: polkassemblyData[0]?.content,
        quiz: latestQuiz,
      })
    }
  })
}

export const pastReferendumFetcher = async () => {
  return new Promise( async ( resolve ) => {
    const client = new ApolloClient({
      uri: websiteConfig.proofofchaos_graphql_endpoint,
      cache: new InMemoryCache(),
    })

    let result = await client.query({
      query: QUERY_REFERENDUMS,
      variables: {
        "where": {
          "endedAt_isNull": false
        },
        "orderBy": "index_DESC",
        "limit": 20
      }
    })

    const pastReferendums20 = result.data.referendums.map( ref => ref.index )
    let pastReferendaStats20 = result.data.referendaStats.filter( ref => pastReferendums20.includes( ref.index ) )
    const pastReferendaPAData20 = await getPADataForRefs( pastReferendums20 )

    // join the referendums from our indexer with the data from Polkassembly
    pastReferendaStats20 = pastReferendaStats20.map( (ref, idx) => {
      return {
        ...ref,
        title: pastReferendaPAData20.find( el => el.onchain_link.onchain_referendum_id === ref.index )?.title,
        description: pastReferendaPAData20.find( el => el.onchain_link.onchain_referendum_id === ref.index )?.content,
      }
    })

    const sortedReferendaStats = pastReferendaStats20.sort((a,b)=>parseInt(b.index)-parseInt(a.index))
    resolve( sortedReferendaStats )
  })
};

export const activeReferendumFetcher = async (ksmAddress) => {
  const api = await getApi()

  const { hash, number } = await api.rpc.chain.getHeader();

  const timestamp = await api.query.timestamp.now.at(hash);
  const totalIssuance = await api.query.balances.totalIssuance().toString()
  const activeReferendums = await api.derive.democracy.referendums()
  let referendums = [];
  let quizzesData = await fetchGov1Quizzes();

  console.log( 'in active ref fetcher', referendums, quizzesData );

  for (const referendum of activeReferendums) {
    const endDate = await getEndDateByBlock(referendum.status.end, number, timestamp)
    const PAData = await getPADataForRefs([referendum.index.toString()]);
    const PADatum = PAData?.[0]
    const quizData = quizzesData.find( q => q.referendumIndex === referendum.index)
    const threshold = getPassingThreshold(referendum, totalIssuance)
    referendums.push(referendumObject(referendum, threshold, endDate, PADatum, quizData, ksmAddress));
  }

  return referendums.sort((a,b)=>parseInt(a.id)-parseInt(b.id));
};

const getPassingThreshold = (referendum, totalIssuance) => {
  return true; /* TODO: incorporate treshold formulas */
}

async function getPADataForRefs(referendumIDs) {
  return new Promise( async ( resolve ) => {
    const client = new ApolloClient({
      uri: websiteConfig.polkassembly_graphql_endpoint,
      cache: new InMemoryCache(),
    })

    let result = await client.query({
      operationName: "ReferendumPostAndComments",
      query: agql`
        query ReferendumPostAndComments($ids: [Int!]) {
          posts(where: {onchain_link: {onchain_referendum_id: {_in: $ids}}}) {
            ...referendumPost
          }
        }
        fragment referendumPost on posts {
          content
          created_at
          title
          onchain_link {
            onchain_referendum_id
          }
        }
    `,
      variables: {
        "ids": [...referendumIDs]
      }
    })

    resolve(result?.data?.posts)
  })
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
  
  // mimic the format of the indexer, TODO later to be replaced by data from indexer
  return {
    index: referendum.index.toString(),
    title: title,
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
    submissions: allSubmissions,
    count_aye: referendum.voteCountAye,
    count_nay: referendum.voteCountNay,
    voted_amount_aye: microToKSM( referendum.votedAye.toString() ),
    voted_amount_nay: microToKSM( referendum.votedNay.toString() ),
    voted_amount_total: microToKSM( parseFloat(referendum.votedNay) + parseFloat(referendum.votedAye) ),
    ended_at: null,
    ends_at: referendum.status.end,
  }
}

export const useReferendums = () => {
  return useQuery( ['activeReferendums'], activeReferendumFetcher )
}

export const usePastReferendums = ( ) => {
  return useQuery(
    [ "pastReferendumData" ],
    async () => {
      return pastReferendumFetcher()
    },
  )
};

export const useReferendum = ( referendumIndex ) => {
  return useQuery(
    [ "referendum", referendumIndex ],
    async() => singleReferendumFetcher( referendumIndex )
  )
}

export const useEndDate = ( endBlock ) => {
  return useQuery(
    [ "referendumEndDate", endBlock ],
    async () => {
      const api = await getApi()
      const { hash, number } = await api.rpc.chain.getHeader();
      const timestamp = await api.query.timestamp.now.at(hash);
      const theEnd = await getEndDateByBlock(endBlock, number, timestamp)
      return theEnd
    }
  )
}