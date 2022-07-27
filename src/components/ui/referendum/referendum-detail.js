import { useEffect, useState } from "react"
import cn from 'classnames'
import Button from "../button"
import ReferendumCountdown from './referendum-countdown'
import ReferendumStats from "./referendum-stats";
import { useModal } from "../../modals/context";
import { useQuizzes } from "../../../lib/hooks/use-quizzes";

export default function ReferendumDetail({ referendum, listIndex }) {
  let [isExpanded, setIsExpanded] = useState(false);

  useEffect( () => {
    if (listIndex === 0 ) {
      setIsExpanded(true);
    }
  }, [listIndex])

  const { quizzes, loading, error } = useQuizzes();
  const questions = quizzes?.[referendum.id];

  const { openModal } = useModal();

  return (
    <div
      className={cn(
        'mb-3 rounded-lg bg-white p-5 transition-shadow duration-200 dark:bg-light-dark xs:p-6',
        {
          'shadow-lg': isExpanded,
          'shadow-card hover:shadow-lg': !isExpanded,
        }
      )}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex w-full flex-col-reverse justify-between md:grid md:grid-cols-3">
        <div className="self-start md:col-span-2 p-2">
          <h3
            onClick={() => setIsExpanded(!isExpanded)}
            className="cursor-pointer text-base font-medium leading-normal dark:text-gray-100 2xl:text-lg"
          >
            {referendum.title}
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Referendum #{referendum.id}
          </p>
          {referendum.status === 'active' && (
            <>
              {!isExpanded ? (
                <>
                  <Button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-4 mr-4 w-full xs:mt-6 xs:w-auto md:mt-10"
                    variant="calm"
                  >
                    Referendum Details
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </Button>
                </>
              ) : (
                <div>
                  <h4 className="mt-4 mb-6 uppercase dark:text-gray-100">Description</h4>
                  <div
                    className="dynamic-html grid gap-2 leading-relaxed text-gray-600 dark:text-gray-400"
                    dangerouslySetInnerHTML={{ __html: referendum.description }}
                  />
                </div>
              )}
            </>
          )}
        </div>
        {['active'].indexOf(referendum.status) !== -1 && (
          <div className="before:content-[' '] content-start relative mb-5 grid h-full gap-2 pb-5 before:absolute before:bottom-0 before:h-[1px] before:w-full before:border-b before:border-r before:border-dashed before:border-gray-200 ltr:before:left-0 rtl:before:right-0 dark:border-gray-700 dark:before:border-gray-700 xs:gap-2.5 md:mb-0 md:pb-0 md:before:h-full md:before:w-[1px] ltr:md:pl-8 rtl:md:pr-8">
            <h3 className="text-gray-400 md:text-base md:font-medium md:uppercase md:text-gray-900 dark:md:text-gray-100 2xl:text-lg ">
              Voting ends in
            </h3>
            <ReferendumCountdown date={referendum.executed_at} />
            {isExpanded &&
              <>
                { !loading && ! error && questions &&
                  <Button
                    onClick={() => openModal('VIEW_REFERENDUM_QUIZ', referendum )}
                    className="mt-4 w-full xs:w-auto"
                    variant="primary"
                  >
                    Take Quiz + Vote
                  </Button>
                }
                <Button
                  onClick={() => openModal('VIEW_REFERENDUM_VOTE', referendum )}
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