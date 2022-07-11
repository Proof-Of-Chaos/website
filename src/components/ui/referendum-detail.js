import { useState } from "react"
import cn from 'classnames'
import Button from "./button"
import ReferendumCountdown from './referendum-countdown'

export default function ReferendumDetail({ referendum }) {
  let [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={cn(
        'mb-3 rounded-lg bg-white p-5 transition-shadow duration-200 dark:bg-light-dark xs:p-6',
        {
          'shadow-lg': isExpanded,
          'shadow-card hover:shadow-lg': !isExpanded,
        }
      )}
    >
      <div className="flex w-full flex-col-reverse justify-between md:grid md:grid-cols-3">
        <div className="self-start md:col-span-2">
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
                <Button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-4 w-full xs:mt-6 xs:w-auto md:mt-10"
                  shape="rounded"
                >
                  Vote Now
                </Button>
              ) : (
                <div>Vote Action</div>
              )}
            </>
          )}
        </div>
        {['active'].indexOf(referendum.status) !== -1 && (
          <div className="before:content-[' '] relative mb-5 grid h-full gap-2 pb-5 before:absolute before:bottom-0 before:h-[1px] before:w-full before:border-b before:border-r before:border-dashed before:border-gray-200 ltr:before:left-0 rtl:before:right-0 dark:border-gray-700 dark:before:border-gray-700 xs:gap-2.5 md:mb-0 md:pb-0 md:before:h-full md:before:w-[1px] ltr:md:pl-8 rtl:md:pr-8">
            <h3 className="text-gray-400 md:text-base md:font-medium md:uppercase md:text-gray-900 dark:md:text-gray-100 2xl:text-lg ">
              Voting ends in
            </h3>
            <ReferendumCountdown date={referendum.executed_at} />
          </div>
        )}
      </div>
    </div>
  )
}