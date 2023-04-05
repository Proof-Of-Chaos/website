import { data } from 'autoprefixer'
import { isEmpty } from 'lodash'
import { NextSeo } from 'next-seo'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Loader from '../../components/ui/loader'
import ReferendumDetail from '../../components/ui/referendum/referendum-detail'
import ReferendumPastDetail from '../../components/ui/referendum/referendum-detail'
import { useGov2Referendum, useGov2Tracks, useIssuance } from '../../hooks/use-gov2'
import { useUserNfts } from '../../hooks/use-nfts'
import { useReferendum } from '../../hooks/use-referendums'
import { useUserVotes } from '../../hooks/use-votes'
import Layout from '../../layouts/layout'


// this is the view for gov2

const ReferendumView = () => {
  const router = useRouter()
  const { refid } = router.query
  const { data: tracks, isLoading: isTracksLoading } = useGov2Tracks();
  const { data: referenda, isLoading, error } = useGov2Referendum( refid )
  const { data: totalIssuance, isLoading: isIssuanceLoading } = useIssuance();
  const { data: userVotes, isFetching: isUserVotesLoading } = useUserVotes(refid ?? -1, true)
  // const { data: userNfts } = useUserNfts()

  if ( ! refid || ! isFinite( refid ) ) {
    return 'not a valid referendum'
  }

  if ( isLoading || isTracksLoading ) {
    return <Loader text={ `loading gov2 referendum ${ refid }`} />
  }

  if ( error ) {
    return <div>
      error: { JSON.stringify( error ) }
      <Link href="/vote">
        Go Back
      </Link>
    </div>
  }

  if ( isEmpty( referenda ) ) {
    return <div>
      referendum { refid } not found
      <Link href="/vote">
        Go Back
      </Link>
    </div>
  }


  let ReferendumView;

    // if ( referendum.ended_at === null ) {
    //   ReferendumView = <ReferendumDetail referendum={ referendum } />
    // } else {
    ReferendumView = <ReferendumPastDetail
      referendum={ referenda[0] }
      isGov2={ true }
      expanded={ true }
      totalIssuance={ totalIssuance }
      track={ tracks.find( t => t[0] == referenda[0].track ) }
      userVote={ userVotes ? userVotes[0] : null }
    />
  // }  

  return <>
    <NextSeo
      title={ `Details for Referendum ${ refid }` }
      description="Take a quiz to receive better NFT rewards, or vote on this Kusama Referendum with your kSM."
    />
    <div className="px-2 xs:px-4 mx-auto max-w-7xl text-sm">
      <Link href="/vote" className='no-underline py-1 sm:py-3 inline-block text-base'>
      ⇽ Go Back Referendum Overview
      </Link>
      {/* <pre>userVotes: { JSON.stringify( userVotes, null, 2) }</pre> */}
      {/* <pre>{ JSON.stringify( referenda[0], null, 2) }</pre> */}
      { ReferendumView }
    </div>
  </>
}

ReferendumView.getLayout = function getLayout(page){
  return <Layout>{page}</Layout>
}

export default ReferendumView