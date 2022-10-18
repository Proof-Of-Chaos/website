import { useEffect, useState } from "react"
import cn from 'classnames'
import Button from "../button"
import ReferendumCountdown from './referendum-countdown'
import ReferendumStats from "./referendum-stats";
import { useModal } from "../../modals/context";
import { useQuizzes } from "../../../hooks/use-quizzes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faChevronDown, faClock, faCube, faChartLine, faSliders } from "@fortawesome/free-solid-svg-icons";
import ReactMarkdown from 'react-markdown'
import { KSMFormatted, microToKSM, microToKSMFormatted } from "../../../utils";
import Loader, { InlineLoader } from "../loader";
import { SingleNFT } from "../../nft/ref-nfts";
import { useUserNfts } from "../../../hooks/use-nfts";
import Image from "next/image";
import { useConfig } from "../../../hooks/use-config";

export default function ReferendumPastDetail( {
  referendum,
  userVote,
  isUserVotesLoading,
  userNFT,
} ) {
  let [isExpanded, setIsExpanded] = useState(false);
  const { openModal } = useModal();

  const {
    count_aye,
    count_nay,
    count_total,
    voted_amount_aye,
    voted_amount_nay,
    voted_amount_total,
    title,
    index,
    description,
    status,
    ends_at,
    ended_at,
  } = referendum

  const { data: refConfig, isLoading: isRefConfigLoading } = useConfig( index )

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

  const UserVote = () => {
    if ( userVote ) {
      const { decision, balance, lockPeriod } = userVote
      return (
        <div className="flex flex-col justify-center">
          { JSON.stringify.userVote }
        { ! isUserVotesLoading && userVote && <>
          <span>You voted <b>{ decision }</b></span>
          <span>with <b>{ microToKSM( balance.value ) } KSM</b></span>
          <span>and conviction <b>{ lockPeriod }</b></span>
        </>}
        </div>
      )
    }

    if ( isUserVotesLoading ) {
      return (<InlineLoader />)
    }

    return <p>{`You did not vote on referendum ${ index }.`}<br/>{ `Vote to receive NFT rewards.` }</p>
  }

  const UserReward = () => {
    if ( userNFT ) {
      const { decision, balance, lockPeriod } = userVote
      return (
        <div className="flex flex-col">
          You received
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

  return (
    <div
      className={cn(
        'mb-10 bg-white p-2 relative md:p-5 transition-shadow duration-200 dark:bg-light-dark xs:p-6 border-b-4 rounded-md border-t-2 border-l-2 border-r-2 border-gray-100 border-b-gray-200',
        {
          'shadow-lg': isExpanded,
          'shadow-card hover:shadow-lg': !isExpanded,
        }
      )}
    >
      <div className="flex flex-wrap w-full flex-row justify-between">
        <div className="self-start p-2 w-full md:w-1/2 border-gray-200 border-r border-dashed">
          <p className="text-xl mt-1 text-gray-600 dark:text-gray-400 ">
            Referendum #{index}
          </p>
          <h3
            onClick={() => setIsExpanded(!isExpanded)}
            className="cursor-pointer text-xl leading-normal dark:text-gray-100 pr-2 border-b border-gray-200 pb-4 mb-4 mr-8 border-dashed"
          >
            {title}
          </h3>
          <>
            { ! isExpanded ? (
              <>
                <div
                  className="order-1 dynamic-html leading-relaxed text-gray-600 dark:text-gray-400 pr-0 md:pr-8 max-h-60 overflow-hidden"
                >
                  <ReactMarkdown>{ description }</ReactMarkdown>
                </div>
                <Button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-4 mr-4 w-full xs:w-auto"
                  variant="black"
                  size="mini"
                >
                  Show More <FontAwesomeIcon className="pl-3" icon={ faChevronDown } />
                </Button>
              </>
            ) : (
              <>
                <div className="order-1">
                  <div
                    className="dynamic-html overflow-scroll leading-relaxed text-gray-600 dark:text-gray-400 pr-0 md:pr-8"
                  >
                    <ReactMarkdown>{ referendum.description }</ReactMarkdown>
                    <div className="referendum-meta pt-2 mt-2">
                      <a className="pr-3" href={ `https://kusama.polkassembly.io/referendum/${ referendum.id }` }>View on Polkassembly ⤻</a>
                      <a href={ `https://kusama.subscan.io/referenda/${ referendum.id }` }>View on Subscan ⤻</a>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-3 mr-4 w-full xs:w-auto text-sm"
                  variant="black"
                  size="mini"
                >
                  Hide Details <FontAwesomeIcon className="pl-3" icon={ faChevronUp } />
                </Button>
              </>
            )}
          </>
        </div>
          <div className="before:content-[' '] text-center w-full md:w-1/2 mt-4 pt-2 md:mt-0 content-start relative mb-5 h-full gap-2 pb-5 before:absolute before:bottom-0 before:h-[1px] before:w-full ltr:before:left-0 rtl:before:right-0 dark:border-gray-700 dark:before:border-gray-700 md:mb-0 md:pb-0 md:before:h-full md:before:w-[1px] ltr:md:pl-8 rtl:md:pr-8">
            <div className="mb-6">
              <h3 className="text-gray-900 mb-2 dark:md:text-gray-100 text-xl">
                Referendum Ended At
              </h3>
              <EndedAt />
            </div>
            <ReferendumCountdown date={referendum.executed_at} />
            <h3 className="text-gray-900 mb-2 dark:md:text-gray-100 text-xl">Referendum Results</h3>
            <div className="md:px-6 xl:px-10">
              <ReferendumStats
                status={ status }
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
            <div className="user-vote">
              <h3 className="text-gray-900 mb-2 mt-4 dark:md:text-gray-100 text-xl">Your Vote</h3>
              <div className="flex justify-evenly">
                <UserVote />
                <UserReward />
              </div>
            </div>
          </div>
          { hasConfig && 
            <div className="border-gray-200 border-dashed border-t w-full mx-2 mt-4 pt-5">
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
    </div>
  )
}

const toPercentage = (part, whole) => {
  return Math.round(parseInt(part) / parseInt(whole) * 100)
}