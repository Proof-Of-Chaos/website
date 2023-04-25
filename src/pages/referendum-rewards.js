import Link from 'next/link'
import { NextSeo } from 'next-seo'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLightbulb } from '@fortawesome/free-solid-svg-icons'

import { websiteConfig } from '../data/website-config'
import Button from '../components/ui/button'
import Layout from '../layouts/layout'
import { nftFeedData } from '../data/nft-feed-data'
import NftFeed from '../components/nft/nft-feed'
import NFTSnippets from '../components/nft/nft-snippets'
import { RewardsCreationForm } from '../components/ui/rewards-creation/rewards-creation-form'

export async function getStaticProps() {
  const nfts = websiteConfig.classic_referendums
  return { props: { nfts } }
}
function ReferendumRewards({ nfts }) {
  return (
    <>
      <NextSeo title="ReferendumRewards" />
        <section className="w-full flex-col py-20 px-5 sm:px-10 md:px-5">
          <h1 class="text-2xl">Create Rewards for a Referendum</h1>
          <p>Here you can create ...</p>
          <RewardsCreationForm />
        </section>
    </>
  )
}

ReferendumRewards.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>
}

export default ReferendumRewards
