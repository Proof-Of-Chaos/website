import Head from 'next/head'
import Image from 'next/image'
import Leaderboard from '../components/nft/leaderboard'
import Layout from '../layouts/layout'



function PageLeaderboard() {
  return (
    <>
      <Head>
        <title>Leaderboard - Proof of Chaos — Free NFTs for Voting on Kusama</title>
      </Head>
      <section className="w-full px-8 py-8 pt-16 xl:px-0">
        <div className="flex flex-col max-w-6xl mx-auto md:flex-row">
          <div className="w-full pr-5 md:w-3/12 xl:pr-12">
            <h3 className="text-3xl font-bold leading-7">Leaderboard</h3>
          </div>

          <div className="w-full mt-5 md:mt-0 md:w-4/5 md:pl-2">
            <p className="text-base font-normal text-gray-700">
              Here you can see the top shelves alongside their wallets. If you are connected you can also see your rank.
            </p>
            <p className="text-base font-normal text-gray-700">
              There will certainly be some utility for the top ranked shelves soon 👀
            </p>
          </div>
        </div>
      </section>
      <section className="w-full px-8 py-8 xl:px-0">
        <div className="max-w-6xl mx-auto">
          <Leaderboard />
        </div>
      </section>
    </>
  )
}

PageLeaderboard.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>
}

export default PageLeaderboard
