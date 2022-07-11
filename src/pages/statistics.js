import Head from 'next/head'
import Image from 'next/image'
import Layout from '../layouts/layout'

function Home() {
  return (
    <>
      <section className="h-screen">
        <h1 className="text-4xl uppercase font-bold">statistics</h1>
      </section>
    </>
  )
}

Home.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>
}

export default Home
