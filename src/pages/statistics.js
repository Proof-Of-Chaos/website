import Head from 'next/head'
import Image from 'next/image'
import Layout from '../layouts/layout'

function Home() {
  return (
    <>
      <section className="h-screen">
        <h1 className="text-4xl uppercase font-bold">statistics</h1>
        <iframe src="https://app.web3go.xyz/#/NftDetail?id=3208723ec6f65df810-ITEM&embedId=chart1" width="600" height="400" frameBorder="0" allowtransparency="true"></iframe>
      </section>
    </>
  )
}

Home.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>
}

export default Home
