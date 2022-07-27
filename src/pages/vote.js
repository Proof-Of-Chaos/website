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
      <section className="py-16 bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900">
        <div className="relative max-w-6xl mx-auto">
            <div className="flex flex-col items-start leading-7 border-0 border-gray-200 lg:items-center lg:flex-row">
                <div className="box-border flex-1 text-left border-solid sm:text-left">
                    <h2 className="m-0 text-gray-200 text-2xl marker:font-semibold leading-tight tracking-tight text-left border-0 border-gray-200 sm:text-4xl">
                        Boost Your Luck
                    </h2>
                    <p className="mt-2 font-md text-gray-200 border-0 border-gray-200 sm:font-lg leading-8">
                        Take a quiz before voting in referenda and your chances <br/> of receiving <span className="nft-rare">rare</span> and <span className="nft-epic">epic</span> NFTs will increase.
                    </p>
                </div>
                <div className="flex flex-col">
                  <Button
                    href=""
                    className="text-gray-200 dark:text-white bg-transparent border-2 border-gray-200 dark:border-white"
                  >
                      Learn More
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                  </Button>
                  <Button
                    href=""
                    className="mt-4 text-gray-200 dark:text-white bg-transparent border-2 border-gray-200 dark:border-white"
                  >
                      I know
                  </Button>
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
