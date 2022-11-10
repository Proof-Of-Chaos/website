import Layout from '../layouts/layout'
import NFTDetail from '../components/nft/ref-nfts'
import { useNFTs, useNFTScores } from '../hooks/use-nfts'
import { groupBy } from 'lodash';
import { websiteConfig } from "../data/website-config"
import objectHash from 'object-hash'
import Loader from '../components/ui/loader';
import { NextSeo } from 'next-seo';

export async function getStaticProps() {
  const nfts = websiteConfig.classic_referendums
  return { props: { nfts } }
}

function PageNFTs({ nfts }) {
  const { data, isLoading } = useNFTs({ initialData: nfts })
  const { data: nftScores, isLoading: isLoadingNFTScores } = useNFTScores()

  const groupedNFTs = groupBy( data,'ref' )

  return (
    <>
      <NextSeo
        title="NFTs"
        description='View all NFTs we sent out and see additional statistics'
      />
      <section className="mx-auto w-full max-w-6xl text-sm sm:pt-10 4xl:pt-14">
        { isLoading && <Loader text="loading NFTs"/>}
        { data && Object.values( groupedNFTs ).map( nfts => {
            return <NFTDetail
              key={ objectHash(nfts) }
              nfts={ nfts }
              scores={ nftScores && nftScores.nftScores.find( score => nfts[0].ref?.includes( score.ref ) ) }
            />
          })
        }
      </section>
    </>
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
