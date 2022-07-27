import Layout from '../layouts/layout'
import NFTDetail from '../components/nft/nft-detail'
import { nftsFetcher, useNfts } from '../lib/hooks/use-nfts'
import { SWRConfig } from 'swr'

function PageNFTs({fallback}) {

  const { nfts, loading, error } = useNfts();

  return (
    <SWRConfig value={{ fallback }}>
      <section className="mx-auto w-full max-w-[1160px] text-sm sm:pt-10 4xl:pt-14">
        { loading && <div>loading...</div> }
        { error && <div>error getting nfts</div> }
        { !loading && !error && nfts && nfts.map( nft => <NFTDetail key={ nft.id } nft={ nft } /> ) }

        <pre className="text-red-500 text-center">... implement a fetch to get more NFTs ...</pre>
        <pre className="text-red-500 text-center">src/lib/hooks/use-nfts.js</pre>
      </section>
    </SWRConfig>
  )
}

PageNFTs.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>
}

export default PageNFTs

//see https://swr.vercel.app/docs/with-nextjs
export async function getStaticProps() {
  const nfts = await nftsFetcher()
  return {
    props: {
      fallback: {
        'nfts': nfts,
      }
    },
    revalidate: 60 * 60, // In seconds
  }
}
