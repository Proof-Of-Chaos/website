import Head from 'next/head'
import Image from 'next/image'
import Layout from '../layouts/layout'

import { allNfts } from '../data/nfts-all'
import NFTDetail from '../components/nft/nft-detail'

function PageNFTs() {
  return (
    <section className="mx-auto w-full max-w-[1160px] text-sm sm:pt-10 4xl:pt-14">
      { allNfts.map( nft => <NFTDetail key={ nft.id } nft={ nft } /> ) }
      <pre className="text-red-500 text-center">... implement a fetch to get more NFTs ...</pre>
      <pre className="text-red-500 text-center">pages/nfts.js</pre>
    </section>
  )
}

PageNFTs.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>
}

export default PageNFTs
