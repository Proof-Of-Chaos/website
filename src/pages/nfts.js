import Layout from '../layouts/layout'
import NFTDetail from '../components/nft/ref-nfts'
import { useNFTs } from '../lib/hooks/use-nfts'
import { groupBy } from 'lodash';
import { websiteConfig } from "../data/website-config"
import objectHash from 'object-hash'
import Loader from '../components/ui/loader';

export async function getStaticProps() {
  const nfts = websiteConfig.classic_referendums
  return { props: { nfts } }
}

function PageNFTs({ nfts }) {
  const { data, isLoading } = useNFTs({ initialData: nfts })
  const groupedNFTs = groupBy( data,'ref' )

  return (
    <section className="mx-auto w-full max-w-6xl text-sm sm:pt-10 4xl:pt-14">
      { isLoading && <Loader />}
      { data && Object.values( groupedNFTs ).map( nfts => {
          return <NFTDetail key={ objectHash(nfts) } nfts={ nfts } />
        })
      }
    </section>
  )
}

PageNFTs.getLayout = function getLayout(page) {
  return (
    <Layout>
      {page}
    </Layout>
  )
}

export default PageNFTs
