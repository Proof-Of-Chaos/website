import React, { useEffect, useState } from 'react';
import Countdown, { zeroPad } from 'react-countdown';
import { getApi } from '../../../data/chain';
import { useEndDate } from '../../../hooks/use-referendums';
import { getEndDateByBlock } from '../../../utils';
import { InlineLoader } from '../loader';

const renderer = ({ days, hours, minutes, seconds, completed }) => {
  if (completed) {
    return null;
  } else {
    return (
      <div className="flex items-center gap-3 text-base justify-center font-medium -tracking-wider text-gray-900 dark:text-gray-100 xs:text-lg md:gap-5 md:text-2xl xl:text-2xl">
        {!!days && (
          <div className="shrink-0 3xl:w-20">
            {zeroPad(days)}
            <span className="md:hidden">d</span>
            <span className="hidden truncate text-sm -tracking-wide text-gray-600 dark:text-gray-400 md:block">
              Days
            </span>
          </div>
        )}
        <div className="shrink-0 3xl:w-20">
          {zeroPad(hours)}
          <span className="md:hidden">h</span>
          <span className="hidden truncate text-sm -tracking-wide text-gray-600 dark:text-gray-400 md:block">
            Hours
          </span>
        </div>
        <div className="shrink-0 3xl:w-20">
          {zeroPad(minutes)}
          <span className="md:hidden">m</span>
          <span className="hidden truncate text-sm -tracking-wide text-gray-600 dark:text-gray-400 md:block">
            Minutes
          </span>
        </div>
        <div className="shrink-0 3xl:w-20">
          {zeroPad(seconds)}
          <span className="md:hidden">s</span>
          <span className="hidden truncate text-sm -tracking-wide text-gray-600 dark:text-gray-400 md:block">
            Seconds
          </span>
        </div>
      </div>
    );
  }
};

export default function ReferendumCountdown({endBlock, className}) {
  const { data:endDate, isLoading } = useEndDate( endBlock )

  if ( isLoading ) {
    return <div className={ className }><InlineLoader /></div>
  }

  return <div className={ className }>
    { endDate && <Countdown date={ endDate } renderer={renderer} className="justify-center" /> }
  </div>
}
