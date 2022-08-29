import {useEffect, useState} from "react";
import { Tab } from "@headlessui/react";
import { getVotesByStatus } from "../../../data/vote-data";
import ReferendumDetail from "./referendum-detail";
import { useReferendums } from '../../../lib/hooks/use-referendums'
import Loader from '../loader'
import useAppStore from "../../../zustand";
import { useIsMounted } from '../../../lib/hooks/use-is-mounted'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}
export function ReferendumList( { voteStatus } ) {

  const isMounted = useIsMounted();
  const setReferendums = useAppStore((state)=>state.setReferendums)
  const cachedReferendums = useAppStore((state)=>state.referendums)

  const { data: referendums, isLoading, error } = useReferendums()
  const { votes, totalVotes } = getVotesByStatus(voteStatus)

  useEffect( () => {
    if ( ! isLoading && ! error && referendums ) {
      setReferendums( referendums )
    }
  }, [])

  const showLoader = isLoading || typeof cachedReferendums === 'undefined'

  return (
    isMounted && <>
      { showLoader && <Loader /> }
      { totalVotes > 0 ? (
        referendums?.map( (referendum, idx) => (
          <div
            key={`${referendum.title}-key-${referendum.id}`}
          >
            <ReferendumDetail referendum={ referendum } listIndex={ idx } />
          </div>
        ))) : (
          <h2 className="mb-3 text-base font-medium leading-relaxed dark:text-gray-100 md:text-lg xl:text-xl">
            There are currently no referendums to vote
          </h2>
        )
      }
    </>
  )
}

export default function ReferendumTabs( props ) {
  const { totalVotes: totalActiveVotes } = getVotesByStatus('active');
  const { totalVotes: totalPastVotes } = getVotesByStatus('past');

  let [categories] = useState({
    Active: <ReferendumList voteStatus={'active'} />,
    Past: <ReferendumList voteStatus={'past'} />,
  })

  return <ReferendumList voteStatus={'active'} />

  {/* return (
    <div className="w-full px-4 py-8">
      <Tab.Group>
        <Tab.List className="flex mb-4 pb-4 border-brand-600">
          {Object.keys(categories).map((category, idx) => (
            <Tab
              key={category}
              className={({ selected }) =>
                classNames(
                  'vote-tab relative w-full py-4 leading-5 border-b-4 rounded-md border-t-2 border-l-2 border-r-2 text-brand-700 outline-none uppercase text-base tracking-widest',
                  selected
                    ? 'active bg-white border-gray-200 border-b-gray-300'
                    : 'text-black border-gray-400 hover:bg-white/[0.12] hover:text-gray-600 border-t-0 border-l-0 border-r-0 border-b-0 hover:bg-gray-100',
                  idx === 0 ? 'mr-2' : 'ml-2',
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
  ) */}
}