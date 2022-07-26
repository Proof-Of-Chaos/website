import Head from 'next/head'
import Image from 'next/image'
import Layout from '../layouts/layout'
import NFTDetail from '../components/nft/nft-detail'
import { useNfts } from '../lib/hooks/use-nfts'
import { useEffect } from 'react'

function PageNFTs() {
  const { nfts, loading, error } = useNfts();

  return (
    <section className="mx-auto w-full max-w-[1160px] text-sm sm:pt-10 4xl:pt-14">
      { loading && <div>loading...</div> }
      { error && <div>error getting nfts</div> }
      { !loading && !error && nfts && nfts.map( nft => <NFTDetail key={ nft.id } nft={ nft } /> ) }

      <pre className="text-red-500 text-center">... implement a fetch to get more NFTs ...</pre>
      <pre className="text-red-500 text-center">src/lib/hooks/use-nfts.js</pre>
    </section>
  )
}

PageNFTs.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>
}

export default PageNFTs
