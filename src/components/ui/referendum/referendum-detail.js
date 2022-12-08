import { useState } from "react"
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faCube, faChartLine, faSliders } from "@fortawesome/free-solid-svg-icons";
import ReactMarkdown from 'react-markdown'

import Button from "../button"
import ReferendumCountdown from './referendum-countdown'
import ReferendumStats from "./referendum-stats";
import { useModal } from "../../modals/context";
import { KSMFormatted, microToKSM, stripHtml, titleCase } from "../../../utils";
import { InlineLoader } from "../loader";
import { useConfig } from "../../../hooks/use-config";
import ReferendumVoteButtons from "./referendum-vote-buttons";
import { useLatestUserVoteForRef } from "../../../hooks/use-votes";

const toPercentage = (part, whole) => {
  return Math.round(parseInt(part) / parseInt(whole) * 100)
}

export default function ReferendumDetail( {
  referendum,
  userVote,
  isUserVotesLoading,
  userNFT,
  isGov2 = false,
} ) {
  const {
    count_aye,
    count_nay,
    voted_amount_aye,
    voted_amount_nay,
    voted_amount_total,
    title,
    index,
    description,
    content,
    status,
    ends_at,
    ended_at,
    track,
    origin,
  } = referendum

  const { openModal } = useModal();
  const { data: refConfig } = useConfig( index )
  const { data: latestUserVote } = useLatestUserVoteForRef( index )

  const isActive = ended_at === null;
  const hasConfig = refConfig && refConfig.options

  const EndedAt = () => {
    return(
      <div className="ended-at">
        <span className="end-time block">
          <FontAwesomeIcon icon={ faClock } className="pr-1 h-3" />{ new Date(ended_at).toUTCString() }
        </span>
        <span className="end-block block">
          <FontAwesomeIcon icon={ faCube } className="pr-1 h-3" />{ ends_at }
        </span>
      </div>
    )
  }

  const Gov2Badges = () => {
    return <div className="gov2-badges mb-4 flex">
      <div className="bg-yellow-300 py-2 px-3 rounded-md flex-1 mr-2">Open Gov</div>
      { track && origin && <div className="bg-slate-300 py-2 px-3 rounded-md flex-1">{ titleCase(origin.origins) }</div> }
    </div>
  }

  const ReferendumBadges = () => {
    return <>
      { status === 'Executed' || status === 'Passed' ? 
        <div
        className="p-2 bg-green-400 rounded-md mb-4 shadow-sm hover:shadow-md transition-shadow"
      >
        { status }
      </div>
      :
      <div
        className="p-2 bg-red-400 rounded-md mb-4 shadow-sm hover:shadow-md transition-shadow"
      >
        { status }
      </div>
      }
    </>
  }

  const UserVote = () => {
    if ( latestUserVote ) {
      const { decision, balance, lockPeriod } = latestUserVote
      return (
        <div className="flex flex-row mb-4 justify-between rounded-md bg-gray-100 shadow-sm hover:shadow-md transition-shadow px-6 py-4 text-sm flex-wrap">
        { ! isUserVotesLoading && <>
          <div className="flex-col w-full text-center">
            <div className="">
              You voted
                <b>
                  { decision === 'yes' ? 
                    <span className="bg-green-400 px-2 py-1 rounded-sm mx-1">Aye</span> :
                    <span className="bg-red-400 px-2 py-1 rounded-sm mx-1">Nay</span>
                  }
                </b>
            </div>
            <div className=""><span>with <b>{ microToKSM( balance.value ) } KSM</b></span></div>
            <div className=""><span>and conviction <b>{ lockPeriod }</b></span></div>
          </div>
        </>}
        </div>
      )
    }

    if ( isUserVotesLoading ) {
      return (<InlineLoader />)
    }

    if ( isActive ) {
      return <p className="mb-4 p-4 bg-gray-100 rounded-md shadow-sm hover:shadow-md transition-shadow">
        { JSON.stringify( latestUserVote ) }
        You did not vote on <br/> referendum { index } yet.<br/>{ `Vote to receive NFT rewards.` }
      </p>
    } else {
      return <p className="mb-4 p-4 bg-gray-100 rounded-md shadow-sm hover:shadow-md transition-shadow">
        { JSON.stringify( latestUserVote ) }
        You did not vote on <br/> referendum { index }.
      </p>
    }
  }

  const UserReward = () => {
    const rarity = userNFT?.metadata_properties?.rarity?.value
    if ( userNFT ) {
      return (
        <div className="flex flex-row justify-between p-4 bg-gray-100 rounded-md mb-4 shadow-sm hover:shadow-md transition-shadow items-center">
          <div >
            You received
            { rarity && <span className={ `mt-2 block nft-${ rarity }` }>{ rarity }</span> }
          </div>
          <Image
            src={`https://ipfs.rmrk.link/ipfs/${ userNFT.resources[0].thumb.replace('ipfs://ipfs/', '') }`}
            alt={ `GovRewards NFT for Referendum ${ index }` }
            width={ 100 }
            height={ 100 }
          />
        </div>
      )
    }
  }

  const ReferendumLinks = ( { referendumId } ) => (
    <div className="referendum-more py-3 px-4 mt-4 bg-gray-100 rounded-md flex items-center">
      <span className="pr-4">View on</span>
      <a
        className="pr-3 grayscale flex" 
        href={ isGov2 ? `https://kusama.polkassembly.io/referenda/${ referendumId }` : `https://kusama.polkassembly.io/referendum/${ referendumId }` }
      >
        <Image
          src='/logos/polkassembly.svg'
          alt="polkassembly logo"
          height={22}
          width={ 110 }
        />
      </a>
      { ! isGov2 && <a className="flex grayscale invert pr-4" href={ `https://kusama.subscan.io/referenda/${ referendumId }` }>
        <Image
          src='/logos/subscan.webp'
          alt="subscan logo"
          height={18}
          width={100}
        />
      </a> }
      <a
        className="flex grayscale"
        href={ isGov2 ? `https://kusama.subsquare.io/referenda/referendum/${ referendumId }` : `https://kusama.subsquare.io/democracy/referendum/${ referendumId }` }
      >
        <Image
          src='/logos/subsquare.svg'
          alt="subscan logo"
          height={30}
          width={120}
        />
      </a>
    </div>
  )

  const refMeta = (
    <>
      { isActive &&
        <>
          <div className="p-4 bg-gray-100 rounded-md mb-4 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-gray-900 mb-3 dark:md:text-gray-100 text-xl">
              Referendum {index} ends in
            </h3>
            <ReferendumCountdown endBlock={ends_at} />
          </div>
          <UserVote />
          <ReferendumVoteButtons referendum={ referendum } />
        </>
      }
      { ! isActive &&
        <>
          <div className="p-4 bg-gray-100 rounded-md mb-4 shadow-sm transition-shadow hover:shadow-md">
            <h3 className="text-gray-900 mb-3 dark:md:text-gray-100 text-xl">
              Referendum {index} ended at
            </h3>
          <EndedAt />
          </div>
          <ReferendumBadges />
          <UserVote />
          <UserReward />
        </>
      }
      <div className="p-4 bg-gray-100 rounded-md mt-4 shadow-sm transition-shadow hover:shadow-md">
        <h3 className="text-gray-900 mb-3 dark:md:text-gray-100 text-xl">
          Referendum {index} results
        </h3>
        <ReferendumStats
          aye={ {
            vote: count_aye,
            percentage: toPercentage( voted_amount_aye, voted_amount_total ),
            voteVolume: KSMFormatted( voted_amount_aye )
          } }
          nay={ {
            vote: count_nay,
            percentage: toPercentage( voted_amount_nay, voted_amount_total),
            voteVolume: KSMFormatted( voted_amount_nay )
          } }
        />
      </div>
    </>
  )

  return (
    <div className="relative mx-auto w-full max-w-7xl rounded-md border-2 border-gray-400 border-b-gray-500 p-3 sm:p-4 md:p-6 my-4 mb-8">
      <div className="w-full flex flex-wrap">
        <div className="left w-full sm:w-7/12 md:w-8/12 pb-6 sm:pb-0 sm:pr-6 border-dashed sm:border-r-2 border-b-2 sm:border-b-0">
          <div className="referendum-heading">
            <div>Referendum {index}</div>
          </div>
          <h3
            className="cursor-pointer text-xl mb-4"
          >
            {title}
          </h3>
          <div className="referendum-description break-words">
            <ReactMarkdown>{ description || stripHtml( content ) }</ReactMarkdown>
          </div>
          <ReferendumLinks referendumId={ referendum.index } />
        </div>
        <div className="right text-center w-full sm:w-5/12 md:w-4/12 pt-6 sm:pt-0 sticky self-start top-24 sm:pl-4 md:pl-6">
          { isGov2 && <Gov2Badges/> }
          { refMeta }
        </div>
      </div>
      { hasConfig &&
          <div className="border-gray-200 border-dashed border-t-2 w-full mx-2 mt-6 pt-6 pl-0 ml-0">
            <Button
              className="w-full"
              variant="calm"
              onClick={ () => openModal( 'PAST_REFERENDUM_DETAIL', { id: index } ) }
            >
              <FontAwesomeIcon icon={ faChartLine } className="pr-2" />
              View Sendout Statistics and Parameters
              <FontAwesomeIcon icon={ faSliders } className="pl-2" />
            </Button>
          </div>
        }
    </div>
  )
}