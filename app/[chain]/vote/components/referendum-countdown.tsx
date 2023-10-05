"use client";

import React, { useEffect, useRef, useState } from "react";
import Countdown, { zeroPad } from "react-countdown";
import { useEndDate } from "@/hooks/vote/use-end-date";
import { Spinner } from "@nextui-org/spinner";
import { useAppStore } from "@/app/zustand";
import { InlineLoader } from "@/components/inline-loader";

type RendererProps = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  completed: boolean;
};

const display = (props: RendererProps | undefined) => {
  const { days, hours, minutes, seconds, completed } = props || {};
  return (
    <div className="flex items-center gap-3 text-base justify-center font-medium -tracking-wider xs:text-lg md:gap-5 md:text-2xl xl:text-2xl">
      {!!days && (
        <div className="shrink-0 3xl:w-20">
          {days !== undefined ? zeroPad(days) : <InlineLoader />}
          <span className="md:hidden">d</span>
          <span className="hidden truncate text-sm -tracking-wide text-gray-600 dark:text-gray-400 md:block">
            Days
          </span>
        </div>
      )}
      <div className="shrink-0 3xl:w-20">
        {hours !== undefined ? zeroPad(hours) : <InlineLoader />}
        <span className="md:hidden">h</span>
        <span className="hidden truncate text-sm -tracking-wide text-gray-600 dark:text-gray-400 md:block">
          Hours
        </span>
      </div>
      <div className="shrink-0 3xl:w-20">
        {minutes !== undefined ? zeroPad(minutes) : <InlineLoader />}
        <span className="md:hidden">m</span>
        <span className="hidden truncate text-sm -tracking-wide text-gray-600 dark:text-gray-400 md:block">
          Minutes
        </span>
      </div>
      <div className="shrink-0 3xl:w-20">
        {seconds !== undefined ? zeroPad(seconds) : <InlineLoader />}
        <span className="md:hidden">s</span>
        <span className="hidden truncate text-sm -tracking-wide text-gray-600 dark:text-gray-400 md:block">
          Seconds
        </span>
      </div>
    </div>
  );
};

const renderer = (endDate: RendererProps) => {
  const { days, hours, minutes, seconds, completed } = endDate;
  if (completed) {
    return <div></div>;
  } else {
    return display({ days, hours, minutes, seconds, completed });
  }
};

export default function ReferendumCountdown({
  endDate,
}: {
  endDate: Date | undefined;
}) {
  return (
    <div className="referendum-countdown">
      {endDate ? (
        <Countdown
          date={endDate}
          renderer={renderer}
          className="justify-center"
        />
      ) : (
        display(undefined)
      )}
    </div>
  );
}
