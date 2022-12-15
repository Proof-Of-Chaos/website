import Layout from '../layouts/layout'
import { countBy, some } from 'lodash';
import { useLatestUserVoteForRef, useLatestVoteForUserAndRef } from '../hooks/use-votes';
import { useGov2Referendums, useGov2Tracks, useIssuance } from '../hooks/use-gov2';
import { titleCase } from '../utils';
import Loader from '../components/ui/loader';
import { useMemo, useState } from 'react';
import { data } from 'autoprefixer';
import { useEffect } from 'react';
import ReferendumDetail from '../components/ui/referendum/referendum-detail';
import { KUSAMA_TRACK_INFO } from '../data/kusama-tracks';
import Tippy from '@tippyjs/react';
// import { useAccounts, useApi, useCall } from '@polkadot/react-hooks';
// import { BN_ZERO } from '@polkadot/util';


/**
 * (0)
 * Add kilt to window in script tag to next js
 * https://nextjs.org/docs/basic-features/script
 */

/**
 * (I)
 * Register a dApp full chain DID via either sporran wallet or check the
 * workshop
 */

/**
 * (I.I)
 * create a well known did config: https://docs.kilt.io/docs/develop/dApp/well-known-did-config
 * 
 * 
 */

/**
 * (II)
 * setup communication between dapp and sporran extension
 * https://docs.kilt.io/docs/develop/dApp/session
 * 
 * const api = Kilt.ConfigService.get('api')
 * const did = '<did from above>'
 * const dAppName = 'Your dApp Name'
 */

/**
 * (III)
 * Frontend claim flow: https://docs.kilt.io/docs/develop/workshop/claimer/request
 *
 * 1. we need to create a claim from the frontend
 * a) have the ctype, content, and lightDID from the claimer ready
 * b) can we get lightDID from sporran?
 * c) claim = Kilt.Claim.fromCTypeAndClaimContents(ctype, content, lightDid)
 * d) content can e.g. look like this:
 * {
 *  age: 28,
 *  name: 'Max Mustermann'
 * }
 *
 * 2. then we need to create a credential from that claim
 * a) credential = Kilt.Credential.fromClaim(claim)
 */


function Test() {
  // const { data: userVote } = useLatestUserVoteForRef( 246 )
  // return <div>test { JSON.stringify( userVote ) }</div>

  let [filteredRefs, setFilteredRefs] = useState([]);
  let [counts, setCounts] = useState([]);

  const filter = ( e, trackId ) => {
    if ( e.currentTarget?.classList.contains('active') ) {
      setFilteredRefs( gov2refs )
      e.currentTarget?.classList.remove('active')
      return
    }

    let filtered = gov2refs.filter( (ref) => {
      return ref.track === parseInt(trackId)
    })
    setFilteredRefs(filtered)
    let siblings = [ ...e.currentTarget?.parentNode.children ]
    siblings.forEach( s => s.classList.remove('active'))
    e.currentTarget?.classList.add('active')
  }

  const { data: tracks, isLoading: isTracksLoading, error } = useGov2Tracks();
  const { data: gov2refs, isLoading } = useGov2Referendums();

  useEffect(() => {
    if ( gov2refs ) {
      setFilteredRefs( gov2refs.filter( ref => ! some([ref.approved, ref.rejected, ref.cancelled]) ) )
      setCounts( countBy(gov2refs,obj => obj.track))
    }
  }, [gov2refs])

  const { data: totalIssuance, isLoading: isIssuanceLoading } = useIssuance();

  return (
    <div className="pl-2">
      <div className="filters">
        tracks: { tracks && tracks.map( (track, idx) => {
          const trackInfo = KUSAMA_TRACK_INFO.find(t => t.id === parseInt(track[0]) )
          return (
            <Tippy key={ `filter-${ idx }` } content={ trackInfo?.text }>
              <button
                onClick={ (e) => filter(e, track[0]) }
                className="btn-track-filter text-sm px-3 py-2 m-1 rounded-sm bg-slate-200 hover:bg-slate-300"
                data-filter={ track[0] }
                style={ {
                  display: counts[track[0]] ? 'inline' : 'none'
                } }
              >
                { titleCase( track[1].name ) } ({counts[track[0]]})
              </button>
            </Tippy>
          )
        })}
      </div>
      {isLoading && <Loader /> }
      <ul className="list-disc">
        {filteredRefs.map( r => 
            <ReferendumDetail
              key={ r.id }
              referendum={ r }
              isGov2={ true }
              totalIssuance={ totalIssuance }
              track={ tracks.find( t => t[0] == r.track ) }
            />
        ) }
      </ul>
      </div>
  )
}

Test.getLayout = function getLayout(page){
  return <Layout>{page}</Layout>
}

export default Test
