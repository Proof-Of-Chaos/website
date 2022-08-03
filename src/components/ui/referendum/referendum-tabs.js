import { useState } from "react";
import { Tab } from "@headlessui/react";
import { getVotesByStatus } from "../../../data/vote-data";
import ReferendumDetail from "./referendum-detail";

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function ReferendumList( { voteStatus } ) {
  const { votes, totalVotes } = getVotesByStatus(voteStatus);
  return (
    <>
      { totalVotes > 0 ? (
        votes.map( (vote, idx) => (
          <div
            key={`${vote.title}-key-${vote.id}`}
          >
            <ReferendumDetail referendum={ vote } listIndex={ idx } />
          </div>
        ))) : (
          <h2 className="mb-3 text-base font-medium leading-relaxed dark:text-gray-100 md:text-lg xl:text-xl">
            There are no referenda to vote atm
          </h2>
        )
      }
    </>
  )
}

export default function ReferndumTabs( props ) {
  const { totalVotes: totalActiveVotes } = getVotesByStatus('active');
  const { totalVotes: totalPastVotes } = getVotesByStatus('past');

  let [categories] = useState({
    Active: <ReferendumList voteStatus={'active'} />,
    Past: <ReferendumList voteStatus={'past'} />,
  })

  return (
    <div className="w-full px-4 py-8">
      <Tab.Group>
        <Tab.List className="flex mb-4 pb-4 border-brand-600">
          {Object.keys(categories).map((category) => (
            <Tab
              key={category}
              className={({ selected }) =>
                classNames(
                  'vote-tab relative w-full py-4 leading-5 border-b-4 rounded-md border-t-2 border-l-2 border-r-2 text-brand-700 outline-none uppercase text-base tracking-widest',
                  selected
                    ? 'active bg-white border-brand-200 border-b-brand-300'
                    : 'text-black border-gray-400 hover:bg-white/[0.12] hover:text-gray-600 border-t-0 border-l-0 border-r-0 border-b-0'
                )
              }
            >
              {category}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-2">
          {Object.values(categories).map((cat, idx) => (
            <Tab.Panel
              key={idx}
            >
              { cat }
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  )
}