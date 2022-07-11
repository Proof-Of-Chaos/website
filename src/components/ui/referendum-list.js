import { useState } from "react";
import { Tab } from "@headlessui/react";
import { getVotesByStatus } from "../../data/vote-data";
import ReferendumDetail from "./referendum-detail";

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function ReferendumList( { voteStatus } ) {
  const { votes, totalVotes } = getVotesByStatus(voteStatus);
  return (
    <>
      { totalVotes > 0 ? (
        votes.map( vote => (
          <div
            key={`${vote.title}-key-${vote.id}`}
          >
            <ReferendumDetail referendum={ vote } />
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
    <div className="w-full px-2 py-16 sm:px-0">
      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
          {Object.keys(categories).map((category) => (
            <Tab
              key={category}
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white shadow'
                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
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