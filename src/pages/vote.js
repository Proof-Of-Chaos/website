import Head from 'next/head'
import Image from 'next/image'
import Layout from '../layouts/layout'

import { NextSeo } from 'next-seo'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPersonBooth } from '@fortawesome/free-solid-svg-icons'
import Button from '../components/ui/button'
import ReferndumTabs from '../components/ui/referendum-tabs'

function Vote() {
  return (
    <>
      <NextSeo
        title="Vote on Kusama"
        description="Get incentive NFTs for voting on Referenda"
      />
      <section className="mx-auto w-full max-w-[1160px] text-sm sm:pt-10 4xl:pt-14">
        <header className="mb-8 flex flex-col gap-4 rounded-lg bg-white p-5 py-6 shadow-card dark:bg-light-dark xs:p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4 xs:items-center xs:gap-3 xl:gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-dark">
              <FontAwesomeIcon size="4x" icon={ faPersonBooth } />
            </div>
            <div>
              <h2 className="mb-2 text-base font-medium uppercase dark:text-gray-100 xl:text-lg">
                In order to vote, you need to connect your Kusama Wallet
              </h2>
              <p className="leading-relaxed text-gray-600 dark:text-gray-400">
                When connected you can go ahead.
              </p>
            </div>
          </div>
          <Button
            shape="rounded"
            fullWidth={true}
            className="uppercase"
          >
            Connect Wallet
          </Button>
        </header>
        <ReferndumTabs />
      </section>
    </>
  )
}

Vote.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>
}

export default Vote
