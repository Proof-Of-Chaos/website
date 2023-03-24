import { countBy } from 'lodash';
import { useState, useEffect } from 'react';
import Tippy from '@tippyjs/react';

import ReferendumDetail from './referendum-detail';
import { KUSAMA_TRACK_INFO } from '../../../data/kusama-tracks';
import { useUserVotes } from '../../../hooks/use-votes';
import { useGov2Referendums, useGov2Tracks, useIssuance } from '../../../hooks/use-gov2';
import { titleCase } from '../../../utils';
import Loader from '../loader';

function Gov2Referenda() {
  let [filteredRefs, setFilteredRefs] = useState([]);
  let [counts, setCounts] = useState([]);

  const { data: tracks, isLoading: isTracksLoading, error } = useGov2Tracks();
  const { data: gov2refs, isLoading } = useGov2Referendums();
  const { data: userVotes, isFetching: isUserVotesLoading, userVotesError } = useUserVotes(null, true)
  const { data: totalIssuance, isLoading: isIssuanceLoading } = useIssuance();

  const votedFilterText = 'Already Voted';
  const notVotedFilterText = 'Not Voted Yet';

  useEffect(()=> {
    if (gov2refs && gov2refs.length) {
      setFilteredRefs( gov2refs )
      let voteCounts = {}

      if (userVotes && userVotes.length) {
        const activeRefIndices = gov2refs.map( ref => ref.index )
        const userVotesForActive = userVotes.filter( vote => activeRefIndices.includes( vote.referendumIndex ) )
        voteCounts = {
          voted: userVotesForActive.length,
          notVoted: activeRefIndices.length - userVotesForActive.length
        }
      }

      setCounts( {
        ...countBy( gov2refs, obj => obj.track ),
        ...voteCounts,
      })
    }
  }, [userVotes, gov2refs])

  const filter = ( e, { trackId, voted } ) => {
    if ( e.currentTarget?.classList.contains('active') ) {
      setFilteredRefs( gov2refs )
      e.currentTarget?.classList.remove('active')
      return
    }

    if (trackId) {
      setFilteredRefs(gov2refs.filter( (ref) => {
        return ref.track === parseInt(trackId)
      }))
    }

    if (typeof voted !== 'undefined' && !isUserVotesLoading && ! userVotesError ) {
      if (voted) {
        const filtered = gov2refs.filter( ref => {
          if (typeof ref.index === 'undefined') {
            return false;
          }
          const userVotedOnRef = userVotes.findIndex( vote => vote.referendumIndex === ref.index ) !== -1
          return userVotedOnRef
        })
        setFilteredRefs(filtered);
      } else {
        const filtered = gov2refs.filter( ref => {
          if (typeof ref.index === 'undefined') {
            return false;
          }
          const userVotedOnRef = userVotes.findIndex( vote => vote.referendumIndex === ref.index ) === -1
          return userVotedOnRef
        })
        setFilteredRefs(filtered);
      }
    }

    let siblings = [ ...e.currentTarget?.parentNode.children ]
    siblings.forEach( s => s.classList.remove('active'))
    e.currentTarget?.classList.add('active')
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* <pre>{ JSON.stringify( filteredRefs, null, 2 ) }</pre> */}
      <div className="filters">
        { tracks && tracks.map( (track, idx) => {
          const trackInfo = KUSAMA_TRACK_INFO.find(t => t.id === parseInt(track[0]) )
          return (
            <Tippy key={ `filter-${ idx }` } content={ trackInfo?.text }>
              <button
                onClick={ (e) => filter(e, {trackId: track[0]}) }
                className="btn-track-filter text-sm px-3 py-1 m-1 rounded-sm bg-slate-200 hover:bg-slate-300"
                style={ {
                  display: counts[track[0]] ? 'inline' : 'none'
                } }
              >
                { titleCase( track[1].name ) } <span className="text-xs text-slate-500">{ counts[track[0]] }</span>
              </button>
            </Tippy>
          )
        })}
        { tracks && counts.voted && <>
          <Tippy content={ 'Only show referenda, you did not vote on yet' }>
            <button
              className="btn-track-filter text-sm px-3 py-1 m-1 rounded-sm bg-violet-200 hover:bg-violet-300"
              onClick={ (e) => filter(e, {voted: false}) }
            >
              { notVotedFilterText } <span className="text-xs text-slate-500">{ counts.notVoted }</span>
            </button>
          </Tippy>
          <Tippy content={ 'Only show referenda, you already voted on' }>
            <button
              className="btn-track-filter text-sm px-3 py-1 m-1 rounded-sm bg-violet-200 hover:bg-violet-300"
              onClick={ (e) => filter(e, {voted: true}) }
            >
              { votedFilterText } <span className="text-xs text-slate-500">{ counts.voted }</span>
            </button>
          </Tippy>
        </>}
      </div>
      <Loader text='Loading Referenda' />
      <ul className="list-disc">
        {filteredRefs.map( r => 
          <ReferendumDetail
            key={ r.index }
            referendum={ r }
            isGov2={ true }
            totalIssuance={ totalIssuance }
            track={ tracks?.find( t => t[0] == r.track ) }
            userVote={ userVotes?.find( vote => vote.referendumIndex === r.index ) }
          />
        ) }
      </ul>
    </div>
  )
}

export default Gov2Referenda
