import {useEffect, useState} from "react";
import { Tab } from "@headlessui/react";

import { usePastReferendums, useReferendums } from '../../../hooks/use-referendums'
import { useIsMounted } from '../../../hooks/use-is-mounted'
import ReferendumDetail from "./referendum-detail";
import { useUserVotes } from "../../../hooks/use-votes";
import { ReferendumList } from "./referendum-list";

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function ReferendumTabs( ) {
  const { data: referendums, isLoading, error } = useReferendums()
  const { data: pastReferendums, isLoading: isPastLoading, error: pastError } = usePastReferendums()
  const { data:userVotes, isFetching: isUserVotesLoading } = useUserVotes()

  console.log( 'gov1 referendums', referendums );
  console.log( 'past gov1 referendums', pastReferendums );

  const activeTabTitle = referendums?.length > 0 ?
    `Active (${ referendums.length })`
    : 'Active'

  let [ categories, setCategories ] = useState({})

  useEffect( () => {
    setCategories({
      [ `${activeTabTitle}` ]: <ReferendumList
      referendums={ referendums }
      referendumStatus='active'
      isLoading={ isLoading }
      error={ error }
      />,
      Past: <ReferendumList
        referendums={ pastReferendums }
        referendumStatus='past'
        isLoading={ isPastLoading }
        error={ pastError }
        userVotes={ userVotes }
        isUserVotesLoading={ isUserVotesLoading }
      />,
    })
  }, [ referendums ])


  return (
    <div className="w-full px-4 py-8">
      <Tab.Group>
        <Tab.List className="flex mb-4 pb-4 border-brand-600">
          {Object.keys(categories).map((category, idx) => (
            <Tab
              key={`tab${idx}`}
              className={({ selected }) =>
                classNames(
                  'vote-tab relative w-full py-4 leading-5 border-b-4 rounded-md border-t-2 border-l-2 border-r-2 outline-none uppercase text-base tracking-widest',
                  selected
                    ? 'active bg-white border-gray-400'
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
  )
}