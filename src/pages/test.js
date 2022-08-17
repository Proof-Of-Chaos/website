
import Layout from '../layouts/layout'
import { useUserNfts } from '../lib/hooks/use-nfts'

function Test() {
  return (
    <>
      Test Page
    </>
  )
}

Test.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>
}

export default Test
