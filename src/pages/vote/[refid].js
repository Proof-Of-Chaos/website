import { data } from 'autoprefixer'
import { isEmpty } from 'lodash'
import { NextSeo } from 'next-seo'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Loader from '../../components/ui/loader'
import ReferendumDetail from '../../components/ui/referendum/referendum-detail'
import ReferendumPastDetail from '../../components/ui/referendum/referendum-detail'
import { useUserNfts } from '../../hooks/use-nfts'
import { useReferendum } from '../../hooks/use-referendums'
import { useUserVotes } from '../../hooks/use-votes'
import Layout from '../../layouts/layout'

const ReferendumView = () => {
  const router = useRouter()
  const { refid } = router.query
  const { data: referendum, isLoading } = useReferendum( parseInt( refid ) )
  const { data: userVotes, isFetching: isUserVotesLoading } = useUserVotes()
  const { data: userNfts } = useUserNfts()

  if ( ! refid ) {
    return <></>
  }

  if ( ! refid || ! isFinite( refid ) ) {
    return <div className="px-2 xs:px-4 mx-auto max-w-7xl text-sm py-10">
        <p className="text-lg text-center">Not a valid referendum</p>
        <Link href="/vote">
          <a className='no-underline py-1 sm:py-3 inline-block text-base'>⇽ Go Back Referendum Overview</a>
        </Link>
    </div>
  }

  if ( isLoading ) {
    return <Loader text={ `loading referendum ${ refid }`} />
  }

  if ( isEmpty( referendum ) ) {
    return <div>
      referendum { refid } not found
      <Link href="/vote">
        <a>Go Back</a>
      </Link>
    </div>
  }


  let ReferendumView;

    // if ( referendum.ended_at === null ) {
    //   ReferendumView = <ReferendumDetail referendum={ referendum } />
    // } else {
    ReferendumView = <ReferendumPastDetail
      referendum={ referendum }
      userVote={ userVotes ? userVotes.find( vote => vote.referendumIndex === referendum.index ) : null }
      isUserVotesLoading={ isUserVotesLoading }
      userNFT={ userNfts && userNfts.find( nft => nft.symbol.startsWith( `${referendum.index}` ) ) }
      expanded={ true }
      expandButtonVisible={ false }
    />
  // }  

  return <>
    <NextSeo
      title={ `Details for Referendum ${ refid }` }
      description="Take a quiz to receive better NFT rewards, or vote on this Kusama Referendum with your kSM."
    />
    <div className="px-2 xs:px-4 mx-auto max-w-7xl text-sm">
      <Link href="/vote">
      <a className='no-underline py-1 sm:py-3 inline-block text-base'>⇽ Go Back Referendum Overview</a>
      </Link>
      { ReferendumView }
    </div>
  </>
}

ReferendumView.getLayout = function getLayout(page){
  return <Layout>{page}</Layout>
}

export default ReferendumView