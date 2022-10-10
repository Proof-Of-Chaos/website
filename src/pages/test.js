
import Layout from '../layouts/layout'
import { useUserNfts } from '../hooks/use-nfts'
import { useUserVotes, useVotes } from '../hooks/use-votes'

function Test() {
  const { data } = useVotes();

  return (
    <>
      Test Page { JSON.stringify(data) }
    </>
  )
}

Test.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>
}

export default Test
