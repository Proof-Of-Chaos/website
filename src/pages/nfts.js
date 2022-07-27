import Layout from '../layouts/layout'
import NFTDetail from '../components/nft/nft-detail'
import { nftsFetcher } from '../lib/hooks/use-nfts'

function PageNFTs({ nfts }) {

  // const { nfts, loading, error } = useNfts();

  return (
    <section className="mx-auto w-full max-w-[1160px] text-sm sm:pt-10 4xl:pt-14">

      { nfts && nfts.map( nft => <NFTDetail key={ nft.id } nft={ nft } /> ) }

      <pre className="text-red-500 text-center">... implement a fetch to get more NFTs ...</pre>
      <pre className="text-red-500 text-center">src/lib/hooks/use-nfts.js</pre>
    </section>
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
      nfts,
    },
    revalidate: 60 * 60, // In seconds
  }
}
