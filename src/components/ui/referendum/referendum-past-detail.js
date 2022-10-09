import { useEffect, useState } from "react"
import cn from 'classnames'
import Button from "../button"
import ReferendumCountdown from './referendum-countdown'
import ReferendumStats from "./referendum-stats";
import { useModal } from "../../modals/context";
import { useQuizzes } from "../../../hooks/use-quizzes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import ReactMarkdown from 'react-markdown'
import useAppStore from "../../../zustand";
import WalletConnect from "../../nft/wallet-connect";
import { useAccountVote } from "../../../hooks/use-referendums";
import { KSMFormatted, microToKSMFormatted } from "../../../utils";

export default function ReferendumPastDetail({ referendum }) {
  let [isExpanded, setIsExpanded] = useState(false);
  const { openModal } = useModal();

  const connectedAccountIndex = useAppStore((state) => state.user.connectedAccount)
  const connectedAccount = useAppStore((state) => state.user.connectedAccounts?.[connectedAccountIndex])

  const { data: userVote } = useAccountVote( referendum.id )

  console.log( 'past ref detail', referendum )

  const {
    count_aye,
    count_nay,
    count_total,
    voted_amount_aye,
    voted_amount_nay,
    title,
    index,
    description,
  } = referendum

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
        <div className="self-start p-2 w-full md:w-2/3 border-gray-200 border-r border-dashed">
          <h3
            onClick={() => setIsExpanded(!isExpanded)}
            className="cursor-pointer text-xl leading-normal dark:text-gray-100 pr-2"
          >
            {title}
          </h3>
          <p className="text-xl mt-1 text-gray-600 dark:text-gray-400 border-b border-gray-200 pb-4 mb-4 mr-8 border-dashed">
            Referendum #{index}
          </p>
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
                    className="dynamic-html leading-relaxed text-gray-600 dark:text-gray-400 pr-0 md:pr-8"
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
          <div className="before:content-[' '] text-center w-full md:w-1/3 mt-4 pt-2 md:mt-0 content-start relative mb-5 h-full gap-2 pb-5 before:absolute before:bottom-0 before:h-[1px] before:w-full ltr:before:left-0 rtl:before:right-0 dark:border-gray-700 dark:before:border-gray-700 md:mb-0 md:pb-0 md:before:h-full md:before:w-[1px] ltr:md:pl-8 rtl:md:pr-8">
            <h3 className="text-gray-900 mb-2 dark:md:text-gray-100 text-xl">
              Voting ended at
            </h3>
            <ReferendumCountdown date={referendum.executed_at} />
            <h3 className="text-gray-900 mb-2 dark:md:text-gray-100 text-xl">Vote Results</h3>
            <ReferendumStats 
              aye={ {
                vote: count_aye,
                percentage: toPercentage(count_aye,count_total),
                voteVolume: KSMFormatted( voted_amount_aye )
              } }
              nay={ {
                vote: count_nay,
                percentage: toPercentage(count_nay,count_total),
                voteVolume: KSMFormatted( voted_amount_nay )
              } } />
          </div>
      </div>
    </div>
  )
}

const toPercentage = (part, whole) => {
  return Math.round(parseInt(part) / parseInt(whole) * 100)
}