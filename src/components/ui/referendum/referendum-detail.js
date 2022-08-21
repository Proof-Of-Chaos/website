import { useEffect, useState } from "react"
import cn from 'classnames'
import Button from "../button"
import ReferendumCountdown from './referendum-countdown'
import ReferendumStats from "./referendum-stats";
import { useModal } from "../../modals/context";
import { useQuizzes } from "../../../lib/hooks/use-quizzes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import ReactMarkdown from 'react-markdown'
import useAppStore from "../../../zustand";
import WalletConnect from "../../nft/wallet-connect";

export default function ReferendumDetail({ referendum, listIndex }) {
  let [isExpanded, setIsExpanded] = useState(false);
  const { openModal } = useModal();
  const connectedAccount = useAppStore((state) => state.user.connectedAccount)

  useEffect( () => {
    if (listIndex === 0 ) {
      setIsExpanded(true);
    }
  }, [listIndex])

  const { quizzes, loading, error } = useQuizzes();
  const questions = quizzes?.[referendum.id];

  return (
    <div
      className={cn(
        'mb-6 bg-white p-5 transition-shadow duration-200 dark:bg-light-dark xs:p-6 border-b-4 rounded-md border-t-2 border-l-2 border-r-2 border-gray-100 border-b-gray-200',
        {
          'shadow-lg': isExpanded,
          'shadow-card hover:shadow-lg': !isExpanded,
        }
      )}
    >
      <div className="flex w-full flex-col justify-between md:grid md:grid-cols-3">
        <div className="self-start md:col-span-2 p-2">
          <h3
            onClick={() => setIsExpanded(!isExpanded)}
            className="cursor-pointer text-xl leading-normal dark:text-gray-100"
          >
            {referendum.title}
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400 border-b border-gray-200 pb-4 mb-4 mr-8 border-dashed">
            Referendum #{referendum.id}
          </p>
          {referendum.status === 'active' && (
            <>
              { ! isExpanded ? (
                <>
                  <div className="order-1">
                    <div
                      className="dynamic-html grid gap-2 leading-relaxed text-gray-600 dark:text-gray-400 pr-8 truncate max-h-60"
                      // dangerouslySetInnerHTML={{ __html: referendum.description }}
                    >
                      <ReactMarkdown>{ referendum.description }</ReactMarkdown>
                    </div>
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
                      className="dynamic-html grid gap-2 leading-relaxed text-gray-600 dark:text-gray-400 pr-8"
                      // dangerouslySetInnerHTML={{ __html: referendum.description }}
                    >
                      <ReactMarkdown>{ referendum.description }</ReactMarkdown>
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
          )}
        </div>
        {['active'].indexOf(referendum.status) !== -1 && (
          <div className="before:content-[' '] border-t-2 border-dashed border-gray-100 md:border-none text-center md:text-left mt-4 pt-4 md:pt-0 md:mt-0 content-start relative mb-5 grid h-full gap-2 pb-5 before:absolute before:bottom-0 before:h-[1px] before:w-full before:border-b before:border-r before:border-dashed before:border-gray-200 ltr:before:left-0 rtl:before:right-0 dark:border-gray-700 dark:before:border-gray-700 xs:gap-2.5 md:mb-0 md:pb-0 md:before:h-full md:before:w-[1px] ltr:md:pl-8 rtl:md:pr-8">
            <h3 className="text-gray-900 dark:md:text-gray-100 text-lg ">
              Voting ends in
            </h3>
            <ReferendumCountdown date={referendum.executed_at} />
            {referendum.castVote &&
              <div>
                Voted { referendum.castVote.aye ? 'aye' : 'nay' } with { referendum.castVote.balance } KSM and { referendum.castVote.conviction } conviction
              </div>
            }
              { connectedAccount ?
                <>
                { !loading && ! error && questions &&
                  <Button
                    onClick={() => openModal( 'VIEW_REFERENDUM_QUIZ', referendum ) }
                    className="mt-4 w-full xs:w-auto"
                    variant="primary"
                  >
                    Take Quiz + Vote
                  </Button>
                }
                <Button
                  onClick={() => openModal( 'VIEW_REFERENDUM_VOTE', referendum ) }
                  className="mt-0 w-full xs:w-auto"
                  variant={ !loading && ! error && questions ? 'calm' : 'primary' }
                >
                  Vote Now
                </Button>
                <ReferendumStats aye={ referendum.aye } nay={ referendum.nay } />
              </>
            :
            <>
              <WalletConnect
                className="w-full"
                title="Vote Now"
                onAccountSelected={ ( ) => { 
                  openModal( 'VIEW_REFERENDUM_VOTE', referendum )
                } }
              />
              { !loading && ! error && questions && <WalletConnect
                  className="w-full"
                  variant="primary"
                  title="Take Quiz + Vote"
                  onAccountSelected={ ( ) => { 
                    openModal( 'VIEW_REFERENDUM_QUIZ', referendum )
                  } }
                />
              }
            </>
          }
          </div>
        )}
      </div>
    </div>
  )
}