"use client";

import { UIReferendum, UITrack } from "../types";
import clsx from "clsx";
import { Button } from "@nextui-org/button";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import styles from "./style.module.scss";
import { useState } from "react";
import ReferendumCountdown from "./referendum-countdown";
import { bnToBn } from "@polkadot/util";
import { ReferendumBadges } from "./referendum-badges";
// import { useState } from "react";

export const ReferendumDetail = ({
  referendum,
  track,
  isExpanded,
}: {
  referendum: UIReferendum;
  track: UITrack;
  isExpanded: boolean;
}) => {
  const { index, title, content, deciding } = referendum;
  const [isDescriptionExpanded, setIsDescriptionExpanded] =
    useState<boolean>(isExpanded);

  const referendumEndBlock = deciding.confirming
    ? bnToBn(deciding.confirming).toNumber()
    : bnToBn(deciding.since).add(bnToBn(track.decisionPeriod)).toNumber();

  console.log(
    "referendum detail",
    referendumEndBlock,
    deciding,
    track.decisionPeriod
  );

  return (
    <div className="referendum-detail relative w-full rounded-sm border border-dashed border-gray-300 p-3 sm:p-4 md:p-6 lg:p-10 xl:p-12 my-4 mb-0 hover:shadow-lg transition-all">
      <div className="w-full flex flex-wrap">
        <div className="flex flex-col left w-full sm:w-7/12 md:w-8/12 pb-6 sm:pb-0 sm:pr-6 border-dashed sm:border-r border-b sm:border-b-0">
          <div className="referendum-heading text-2xl mb-3 font-bold">
            <div>Referendum {index}</div>
          </div>
          <h3 className="cursor-pointer text-lg mb-4">{title}</h3>
          <div className="flex-1">
            <ScrollShadow className="w-full h-[300px]">
              <div
                className={clsx(
                  styles.referendumDescription,
                  "referendum-description break-words text-sm",
                  {
                    [styles.descriptionOverflowHidden]: !isDescriptionExpanded,
                  }
                )}
                dangerouslySetInnerHTML={{ __html: content ?? "" }}
              ></div>
            </ScrollShadow>
          </div>
          {/* <ReferendumLinks
          referendumId={referendum.index}
          className="referendum-links"
        /> */}
        </div>
        <div className="right text-center w-full sm:w-5/12 md:w-4/12 pt-6 sm:pt-0 sticky self-start top-24 sm:pl-4 md:pl-6">
          <ReferendumBadges
            referendum={referendum}
            track={track}
            decidingPercentage={0}
            confirmingPercentage={0}
          />
          <ReferendumCountdown endBlock={referendumEndBlock} />
        </div>
      </div>
      <pre className="text-xs">
        <b>trackInfo:</b>
        {JSON.stringify(track, null, 2)}
      </pre>
      <pre className="text-xs">
        <b>refInfo:</b> {JSON.stringify(referendum, null, 2)}
      </pre>
    </div>
  );
};
