import { useEffect, useState } from "react"
import cn from 'classnames'
import Button from "../button"
import ReferendumCountdown from './referendum-countdown'
import ReferendumStats from "./referendum-stats";
import { useModal } from "../../modals/context";
import { useQuizzes } from "../../../lib/hooks/use-quizzes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { getWallets } from '@talisman-connect/wallets';
import useAppStore from "../../../zustand";

export default function ReferendumDetail({ referendum, listIndex }) {
  const connectedWallet = useAppStore((state) => state.user.connectedWallet)
  let [isExpanded, setIsExpanded] = useState(false);

  useEffect( () => {
    if (listIndex === 0 ) {
      setIsExpanded(true);
    }
  }, [listIndex])

  const { quizzes, loading, error } = useQuizzes();
  const questions = quizzes?.[referendum.id];
  const supportedWallets = getWallets();

  const { openModal } = useModal();

  const openModalAfterConnect = function(view, referendum) {
    let useWallet = getWallets().find(foundWallet => foundWallet.extensionName === connectedWallet?.source)

    if (useWallet) {
      openModal( view, referendum )
    } else {
      alert("Connect wallet first. TODO: trigger wallet connect")
    }
  }

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
              {!isExpanded ? (
                <>
                  <Button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-2 mr-4 w-full xs:mt-2 xs:w-auto md:mt-2"
                    variant="calm"
                    size="mini"
                  >
                    Referendum Details <FontAwesomeIcon className="pl-3" icon={ faChevronDown } />
                  </Button>
                </>
              ) : (
                <>
                  <div className="order-1">
                    <div
                      className="dynamic-html grid gap-2 leading-relaxed text-gray-600 dark:text-gray-400 pr-8"
                      dangerouslySetInnerHTML={{ __html: referendum.description }}
                    />
                  </div>
                  <Button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-3 mr-4 w-full xs:w-auto text-sm"
                    variant="calm"
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
            {isExpanded &&
              <>
                { !loading && ! error && questions &&
                  <Button
                    onClick={() => openModalAfterConnect('VIEW_REFERENDUM_QUIZ', referendum )}
                    className="mt-4 w-full xs:w-auto"
                    variant="primary"
                  >
                    Take Quiz + Vote
                  </Button>
                }
                <Button
                  onClick={() => openModalAfterConnect('VIEW_REFERENDUM_VOTE', referendum )}
                  className="mt-0 w-full xs:w-auto"
                  variant="calm"
                >
                  Vote Now
                </Button>
                <ReferendumStats aye={ referendum.aye } nay={ referendum.nay } />
              </>
            }
          </div>
        )}
      </div>
    </div>
  )
}