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
