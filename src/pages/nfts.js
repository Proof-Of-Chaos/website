import Layout from '../layouts/layout'
import NFTDetail from '../components/nft/ref-nfts'
import { nftsFetcher, userNftsFetcher } from '../lib/hooks/use-nfts'
import { groupBy } from 'lodash';
import { useEffect, useState } from 'react'
import { websiteConfig } from "../data/website-config"
import useAppStore from '../zustand';

function PageNFTs() {
  const [nfts, setNfts] = useState(groupBy( websiteConfig.classic_referendums, 'ref' ))
  const updateUserNfts = useAppStore( (state) => state.updateUserNfts )
  const userWallet = useAppStore( (state) => state.user.connectedWallet )

  useEffect(() => {
    nftsFetcher().then((data) => {
        setNfts(groupBy( data, 'ref' ))
        console.log( 'aaa', nfts );
    })
  }, [])

  useEffect(()=> {
    userNftsFetcher( userWallet?.ksmAddress ).then( ( { data } )=> {
      updateUserNfts( data.nfts )
      console.log('new user nfts:', data.nfts )
    })
  }, [ userWallet ])

  return (
    <section className="mx-auto w-full max-w-[1160px] text-sm sm:pt-10 4xl:pt-14">

      { nfts && Object.values(nfts).map( refNfts => <NFTDetail key={ refNfts[0].ref } nfts={ refNfts } /> ) }

      <pre className="text-red-500 text-center">src/lib/hooks/use-nfts.js</pre>
    </section>
  )
}

PageNFTs.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>
}

export default PageNFTs