import { useEffect, useRef, useState } from "react"
import { bnToBn, BN_MILLION, BN_ONE, BN_THOUSAND, isBn } from "@polkadot/util";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faCube, faChartLine, faSliders } from "@fortawesome/free-solid-svg-icons";
import ReactMarkdown from 'react-markdown'
import Tippy from "@tippyjs/react";
import Image from "next/image";

import Button from "../button"
import ReferendumCountdown from './referendum-countdown'
import ReferendumStats from "./referendum-stats";
import ReferendumVoteButtons from "./referendum-vote-buttons";

import { useModal } from "../../modals/context";
import { KSMFormatted, microToKSM, stripHtml, titleCase } from "../../../utils";
import { InlineLoader } from "../loader";
import { useConfig } from "../../../hooks/use-config";
import { useLatestUserVoteForRef } from "../../../hooks/use-votes";
import { getTrackInfo } from "../../../data/kusama-tracks";
import { curveThreshold, getPercentagePassed } from "../../../gov2-utils";

import useAppStore from "../../../zustand";

const toPercentage = (part, whole) => {
  return Math.round(parseInt(part) / parseInt(whole) * 100)
}

export default function ReferendumDetail( {
  referendum,
  userVote,
  isUserVotesLoading,
  userNFT,
  isGov2 = false,
  totalIssuance,
  track,
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
    origin,
    tally,
    deciding,
    decisionDeposit,
    submissionDeposit,
    rejected,
    approved,
  } = referendum

  const { openModal } = useModal();
  const { data: refConfig } = useConfig( index )
  const { data: latestUserVote } = useLatestUserVoteForRef( index )

  //the percentage that has passed in the deciding period: 0 <= decidingPercentage <= 1
  const [decidingPercentage, setDecidingPercentage] = useState(0)
  const [confirmingPercentage, setConfirmingPercentage] = useState(0)

  //will store Big Numbers to be converted before display
  const [supportThreshold, setSupportThreshold] = useState(bnToBn(0))
  const [approveThreshold, setApproveThreshold] = useState(bnToBn(0))

  const isActive = ended_at === null;
  const hasConfig = refConfig && refConfig.options

  const metaRef = useRef(null);

  const currentBlockNumber = useAppStore((state) => state.chain.currentBlock).toNumber();

  const gov2status = rejected ?
    'Rejected' : approved ?
      'Approved' : deciding?.confirming && deciding?.confirming !== null ?
        'Confirming' : decisionDeposit === null ?
          'Awaiting Deposit' : deciding?.since ?
            'Deciding' : submissionDeposit !== null ? 
              'Submitted' : 'Unknown State';

  useEffect(() => {
    if ( deciding?.since && track) {
      const {
        decisionPeriod,
        confirmPeriod
      } = track?.[1]

      const dPercentage = getPercentagePassed(decisionPeriod, deciding.since, currentBlockNumber);
      setDecidingPercentage( dPercentage );
      setSupportThreshold( curveThreshold(track?.[1].minSupport, dPercentage * 1000 ) )
      setApproveThreshold( curveThreshold( track?.[1].minApproval, dPercentage * 1000 ) )

      if (deciding?.confirming) {
        const cPercentage = getPercentagePassed(confirmPeriod, deciding.confirming - confirmPeriod, currentBlockNumber);
        setConfirmingPercentage( cPercentage )
      }
    }
  }, [deciding, currentBlockNumber, track])

  useEffect(() => {
    //unset sticky if content on right is too high
    if ( (metaRef.current?.offsetHeight + 16 * 6 ) > window.innerHeight ) {
      metaRef.current.classList.remove('sticky');
    }
  })

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
    let percentage = gov2status === 'Confirming' ? confirmingPercentage : decidingPercentage;
    const fromColor = gov2status === 'Confirming' ? '#86EFAC' : '#facc15'
    const toColor = gov2status === 'Confirming' ? '#4ade80' : '#eab308'
    const statusBadgeBg = `linear-gradient(90deg, ${fromColor} 0%, ${fromColor} ${ percentage * 100 }%, ${toColor} ${ percentage * 100 }%, ${toColor} 100%)`

    return <div className="gov2-badges mb-2 flex">
      { track?.[0] !== 0 && origin?.origins &&
        <Tippy content={ getTrackInfo( parseInt(track?.[0]) )?.text }>
          <div className="text-sm bg-gray-200 py-1 px-2 rounded-md flex-1 cursor-default mr-2">
            { titleCase(origin.origins) }
          </div>
        </Tippy>
      }
      <Tippy content={ `${ (percentage * 100).toFixed(2) }% of the ${gov2status === 'Confirming' ? 'confirming' : 'deciding'} period has passed` }>
        <div
          className="text-sm py-1 px-2 rounded-md flex-1 cursor-default"
          style={ { background: statusBadgeBg } }
        >
          { gov2status }
        </div>
      </Tippy>
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
    console.log( 'userVote', latestUserVote, userVote )
    if ( latestUserVote || userVote ) {
      const { decision, balance, lockPeriod } = latestUserVote || userVote
      return (
        <div className="flex flex-row mb-2 justify-between rounded-md bg-gray-100 shadow-sm hover:shadow-md transition-shadow px-6 py-4 text-sm flex-wrap">
        { ! isUserVotesLoading && <>
          <div className="flex-col w-full text-center">
            <div className="">
              You voted
                <b>
                  { decision === 'yes' &&
                    <span className="bg-green-400 px-2 py-1 rounded-sm mx-1">Aye</span>
                  }
                  { decision === 'no' &&
                    <span className="bg-red-400 px-2 py-1 rounded-sm mx-1">Nay</span>
                  }
                  { decision === 'split' &&
                    <>
                      <span className="bg-green-400 px-2 py-1 rounded-sm mx-1">Aye</span>+
                      <span className="bg-red-400 px-2 py-1 rounded-sm mx-1">Nay</span>
                    </>
                  }
                </b>
            </div>
            { decision !== 'split' ?
              <>
                <div className="">
                  <span>with <b>{ microToKSM( balance.value ) } KSM</b></span>
                </div>
                <div className=""><span>and conviction <b>{ lockPeriod }</b></span></div>
              </> : 
              <div className="">
                <span>with <b>{ microToKSM( balance.aye) }</b> + <b>{ microToKSM( balance.nay) } KSM</b></span>
              </div>
            }
          </div>
        </>}
        </div>
      )
    }

    if ( isUserVotesLoading ) {
      return (<InlineLoader />)
    }

    if ( isActive ) {
      return <p className="text-sm mb-2 p-4 bg-gray-100 rounded-md shadow-sm hover:shadow-md transition-shadow">
        { latestUserVote && JSON.stringify( latestUserVote ) }
        You did not vote on <br/> referendum { index } yet.<br/>{ `Vote to receive NFT rewards.` }
      </p>
    } else {
      return <p className="text-sm mb-2 p-4 bg-gray-100 rounded-md shadow-sm hover:shadow-md transition-shadow">
        { latestUserVote && JSON.stringify( latestUserVote ) }
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
    <>
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
    </>
  )

  const referendumMeta = (
    <>
      { isGov2 && <Gov2Badges/> }
      { isActive &&
        <>
          <div className="p-4 bg-gray-100 rounded-md mb-2 shadow-sm hover:shadow-md transition-shadow">
            { isGov2 ?
              <>
                { gov2status === 'Awaiting Deposit' ? 
                <>
                  <h3 className="text-gray-900 mb-2 dark:md:text-gray-100 text-md">
                    { `Waiting for anyone to pay the decision deposit for Referendum ${index}` }
                  </h3>
                </>
                :
                <>
                  <Tippy content={ 'If the referendum does not enter the confirming state, it will automatically be rejected' }>
                    <h3 className="text-gray-900 mb-2 dark:md:text-gray-100 text-md">
                    { `Referendum ${index} will be ${gov2status === 'Deciding' ? 'decided' : 'confirmed'} in` }
                    </h3>
                  </Tippy>
                  { gov2status === 'Deciding' && <ReferendumCountdown endBlock={ deciding.since + track[1].decisionPeriod } /> }
                  { gov2status === 'Confirming' && <ReferendumCountdown endBlock={ deciding.confirming } /> }
                </>
                }
              </>
              :
              <>
              <h3 className="text-gray-900 mb-2 dark:md:text-gray-100 text-lg">
                { `Referendum ${index} ends in` }
              </h3>
              <ReferendumCountdown endBlock={ends_at} />
              </>
            }
          </div>
          <UserVote />
          <ReferendumVoteButtons referendum={ referendum } userVote={ userVote }/>
        </>
      }
      { ! isActive &&
        <>
          <div className="p-4 bg-gray-100 rounded-md mb-2 shadow-sm transition-shadow hover:shadow-md">
            <h3 className="text-gray-900 mb-2 dark:md:text-gray-100 text-xl">
              Referendum {index} ended at
            </h3>
          <EndedAt />
          </div>
          <ReferendumBadges />
          <UserVote />
          <UserReward />
        </>
      }
      <div className="p-4 bg-gray-100 rounded-md mt-2 shadow-sm transition-shadow hover:shadow-md">
        <h3 className="text-gray-900 mb-2 dark:md:text-gray-100 text-md">
          { isGov2 ? `Referendum ${index} Approval` : `Referendum ${index} results`}
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
          threshold={ parseFloat(approveThreshold / 1000000000) }
        />
        { isGov2 && <>
          <h3 className="text-gray-900 mb-2 dark:md:text-gray-100 text-md mt-3">
            { `Referendum ${index} Support` }
          </h3>
          <ReferendumStats
            part={ tally?.support }
            total={ totalIssuance }
            threshold={ parseFloat(supportThreshold / 1000000000) }
          />
        </> }
        {/* <pre className="text-xs text-left">{ currentBlockNumber } -- { JSON.stringify( track?.[1], null, 2 ) }</pre> */}
      </div>
    </>
  )

  return (
    <div className="relative w-full rounded-md border-2 border-gray-100 shadow-lg p-3 sm:p-4 md:p-6 my-4 mb-8">
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
          <div className="referendum-description break-words text-sm">
            <ReactMarkdown>{ description || stripHtml( content ) }</ReactMarkdown>
            {/* <pre>{ JSON.stringify( referendum, null, 2) }</pre> */}
          </div>
          <ReferendumLinks referendumId={ referendum.index } />
        </div>
        <div ref={ metaRef } className="right text-center w-full sm:w-5/12 md:w-4/12 pt-6 sm:pt-0 sticky self-start top-24 sm:pl-4 md:pl-6">
          { referendumMeta }
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