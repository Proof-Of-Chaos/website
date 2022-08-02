import Head from 'next/head'
import Image from 'next/image'
import Layout from '../layouts/layout'

import { NextSeo } from 'next-seo'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPersonBooth } from '@fortawesome/free-solid-svg-icons'
import Button from '../components/ui/button'
import ReferndumTabs from '../components/ui/referendum/referendum-tabs'

function Vote() {
  return (
    <>
      <NextSeo
        title="Vote on Kusama"
        description="Get incentive NFTs for voting on Referenda"
      />
      <section className="bg-gradient-to-r from-blue-500 to-purple-500">
        <div className="px-4 py-8 mx-auto max-w-7xl">
          <div
            className="relative py-6 overflow-hidden rounded-lg lg:py-12 md:px-6 lg:p-16 lg:flex lg:items-center lg:justify-between"
            data-rounded="rounded-lg" data-rounded-max="rounded-full">
            <div className="relative p-6 rounded-lg md:p-0 md:pb-4">
              <h2 className="text-3xl font-extrabold leading-9 tracking-tight text-white sm:text-4xl sm:leading-10">
                Boost Your Luck.
              </h2>
              <p className="w-full mt-5 text-base leading-8 text-white md:w-3/4" data-primary="pink-600">
                Take a quiz before voting in referenda and your chances of receiving <span className="nft-rare">rare</span> and <span className="nft-epic">epic</span> NFTs will increase.
              </p>
            </div>
            <div
              className="relative flex flex-col items-center w-full px-6 space-y-5 md:space-x-5 md:space-y-0 md:flex-row md:w-auto lg:flex-shrink-0 md:px-0">
              <a href="#_"
                className="block w-full px-5 py-3 text-base font-medium leading-6 text-center text-purple-600 transition duration-150 ease-in-out bg-purple-100 rounded-md md:inline-flex md:shadow md:w-auto hover:bg-white focus:outline-none focus:shadow-outline"
                data-primary="purple-600" data-rounded="rounded-md">
                Learn more
              </a>
              <a href="#_" className="text-white border-2 px-5 py-3 w-full md:w-auto text-center rounded-md border-white">
                I know
              </a>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto w-full max-w-[1160px] text-sm sm:pt-10 4xl:pt-14">
        <ReferndumTabs />
      </section>
    </>
  )
}

Vote.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>
}

export default Vote
