
import Layout from '../layouts/layout'
import { useUserNfts } from '../lib/hooks/use-nfts'

function Test() {

  const { data: userNFTs } = useUserNfts( "DT7kRjGFvRKxGSx5CPUCA1pazj6gzJ6Db11xmkX4yYSNK7m" )
  const userNFTSymbols = userNFTs.map( ( { symbol } ) => symbol )
  return (
    <>
      { JSON.stringify(userNFTSymbols) }
    </>
  )
}

Test.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>
}

export default Test
