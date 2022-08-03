import Layout from '../layouts/layout'
import NFTDetail from '../components/nft/ref-nfts'
import { nftsFetcher } from '../lib/hooks/use-nfts'
import { groupBy } from 'lodash';

function PageNFTs({ nfts }) {

  // const { nfts, loading, error } = useNfts();

  const nftsByReferendumId = groupBy( nfts, 'ref' );
  console.log( 'yyy', nftsByReferendumId );

  return (
    <section className="mx-auto w-full max-w-[1160px] text-sm sm:pt-10 4xl:pt-14">

      { nftsByReferendumId && Object.values(nftsByReferendumId).map( refNfts => <NFTDetail key={ refNfts[0].ref } nfts={ refNfts } /> ) }

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
