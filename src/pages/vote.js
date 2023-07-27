import Head from 'next/head'
import Image from "next/legacy/image"
import Layout from '../layouts/layout'
import { Menu, Transition } from '@headlessui/react'
import { Fragment, useEffect, useRef, useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

import { NextSeo } from 'next-seo'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPersonBooth } from '@fortawesome/free-solid-svg-icons'
import Button from '../components/ui/button'
import ReferendumTabs from '../components/ui/referendum/referendum-tabs'
import useAppStore from '../zustand'
import Gov2Referenda from '../components/ui/referendum/gov2-referenda'
function Vote() {
  // const knowsAboutLuckBoost = useAppStore( state => state.user.knowsAboutLuckBoost );
  const knowsAboutLuckBoost = false;
  const updateLuckKnowledge = useAppStore( state => state.updateLuckBoostKnowledge );

  const [govVersion,setGovVersion] = useState(2);

  const toggleGovVersion = () => {
    govVersion === 1 ? setGovVersion(2) : setGovVersion(1)
  }

  return (
    <>
      <NextSeo
        title="Vote on Referendums"
        description="Get incentive NFTs for voting on referendums"
      />
      { !knowsAboutLuckBoost && <section className="bg-gradient-to-r from-blue-500/80 to-purple-500/80">
        <div className="px-4 py-8 mx-auto max-w-7xl">
          <div
            className="relative py-6 overflow-hidden rounded-lg lg:py-12 md:px-6 lg:p-16 g:flex lg:items-center lg:justify-between overflow-visible"
            data-rounded="rounded-lg" data-rounded-max="rounded-full">
            <div className="relative p-6 rounded-lg md:p-0 md:pb-4">
              <h2 className="text-3xl font-extrabold leading-9 tracking-tight text-white sm:text-4xl sm:leading-10">
                NFT sendouts are paused at the moment
              </h2>
              <p className="w-full max-w-lg mt-5 text-base leading-8 text-white md:w-3/4" data-primary="pink-600">
              We are currently working on decentralising the rewards send-out logic. Stay tuned on Twitter for announcements.<br/><br/>You can still vote on our site!
              </p>
            </div>
            <Menu as="div" className="inline-block text-left absolute right-0 w-26">
              <div className="">
                <Menu.Button className="inline-flex w-full justify-center rounded-md bg-black bg-opacity-50 px-5 py-3 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                  Gov {govVersion}
                  <ChevronDownIcon
                    className="ml-2 -mr-1 h-5 w-5 text-violet-200 hover:text-violet-100"
                    aria-hidden="true"
                  />
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-24 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="px-1 py-1 ">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          className={`${
                            active ? 'bg-violet-400 text-white' : 'text-gray-900'
                          } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                          onClick={ toggleGovVersion }
                        >
                          Gov {govVersion === 2 ? '1' : '2'}
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
            { false && <div
              className="relative flex flex-col items-center w-full px-6 space-y-5 md:space-x-5 md:space-y-0 md:flex-row md:w-auto lg:flex-shrink-0 md:px-0">
              <Button href="#_"
                className="block w-full px-5 py-3 text-base font-medium leading-6 text-center text-indigo-900 transition duration-150 ease-in-out bg-purple-100 border-2 border-gray-100 rounded-md md:inline-flex md:shadow md:w-auto hover:bg-white focus:outline-none focus:shadow-outline"
                onClick={ () => updateLuckKnowledge( true ) }
              >
                Learn more
              </Button>
              <Button
                href="#"
                onClick={ () => updateLuckKnowledge( true ) }
                className="text-white border-2 px-5 py-3 w-full md:w-auto text-center rounded-md border-white hover:bg-indigo-800/40"
              >
                I know
              </Button>
            </div> }
          </div>
        </div>
      </section> }
      <section className="mx-auto w-full max-w-7xl text-sm sm:pt-10 4xl:pt-14">
        { govVersion === 1 ? <ReferendumTabs /> : <Gov2Referenda /> }
      </section>
    </>
  )
}

Vote.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>
}

export default Vote
