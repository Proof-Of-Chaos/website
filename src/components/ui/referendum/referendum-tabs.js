import {useEffect, useState} from "react";
import { Tab } from "@headlessui/react";
import ReferendumDetail from "./referendum-detail";
import { usePastReferendums, useReferendums } from '../../../hooks/use-referendums'
import Loader from '../loader'
import useAppStore from "../../../zustand";
import { useIsMounted } from '../../../hooks/use-is-mounted'
import ReferendumPastDetail from "./referendum-past-detail";
import { useUserVotes } from "../../../hooks/use-votes";
import { useUserNfts } from "../../../hooks/use-nfts";

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function PastReferendumList( ) {
  const { data: referendums, isLoading, error } = usePastReferendums()
  const { data:userVotes, isFetching: isUserVotesLoading } = useUserVotes()
  const { data: userNfts } = useUserNfts()

  const isMounted = useIsMounted();

  return (
    isMounted && <>
    { isLoading && <Loader /> }
    { ! isLoading && referendums?.length > 0 ?
        referendums?.map( (referendum, idx) => (
          <div
            key={`${referendum.title}-key-${referendum.index}`}
          >
            <ReferendumPastDetail
              referendum={ referendum }
              listIndex={ idx }
              userVote={ userVotes ? userVotes.find( vote => vote.referendumIndex === referendum.index ) : null }
              isUserVotesLoading={ isUserVotesLoading }
              userNFT={ userNfts && userNfts.find( nft => nft.symbol.startsWith( `${referendum.index}` ) ) }
            />
          </div>
        )) :
        <h2 className="mb-3 text-base font-medium leading-relaxed dark:text-gray-100 md:text-lg xl:text-xl">
          There are currently no referendums to vote
        </h2>
      }
    </>
  )
}

export function ReferendumList() {
  const { data: referendums, isLoading, error } = useReferendums()

  if ( isLoading ) {
    return <Loader />
  }

  if ( error ) {
    return <code>{ JSON.stringify( error ) }</code>
  }

  return (
    <>
      { referendums && referendums.length > 0 ?
        referendums.map( (referendum, idx) => (
          <div
            key={`${referendum.title}-key-${referendum.id}`}
          >
            <ReferendumDetail referendum={ referendum } listIndex={ idx } />
          </div>
        )) :
        <h2 className="mb-3 text-base font-medium leading-relaxed dark:text-gray-100 md:text-lg xl:text-xl">
          There are currently no referendums to vote
        </h2>
      }
    </>
  )
}

export default function ReferendumTabs( props ) {
  const { data: referendums, isLoading, error } = useReferendums()
  const { data: pastReferendums, isLoading: isPastLoading, error: pastError } = usePastReferendums()
  {/* console.log( 'tabs active', referendums ) */}

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
      Past: <PastReferendumList
        referendums={ pastReferendums }
        referendumStatus='past'
        isLoading={ isPastLoading }
        error={ pastError }
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
  )
}