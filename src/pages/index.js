import Head from 'next/head'
import Image from 'next/image'
import Button from '../components/ui/button'
import NftFeed from '../components/ui/nft-feed'
import Layout from '../layouts/layout'
import { nftFeedData, priceFeedData } from '../data/nft-feed-data'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLightbulb } from '@fortawesome/free-solid-svg-icons'
import NFTSnippets from '../components/ui/nft-snippets'
import FAQ from '../components/ui/faq'

function Home() {
  return (
    <>
      <section className="h-auto relative">
          <div className="relative px-6 py-20 sm:px-10 mb-10 overflow-visible">
            <div className="relative z-10 mx-auto py-3 text-left md:text-center max-w-screen-xl overflow-hidden pointer-events-none">
              <h1 className="z-90 mb-6 text-4xl font-extrabold max-w-5xl mx-auto tracking-normal text-gray-900 sm:text-6xl md:text-6xl lg:text-7xl md:tracking-tight lg:leading-tight"> We <span className="w-full text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 lg:inline">incentivize voting</span> to decentralize Kusama</h1>
              <p className="px-0 mb-12 text-lg text-gray-600 md:text-xl lg:px-24">The items in the collection are airdropped 100% free of charge to voters of Kusama referenda. Each time a wallet votes on a Referendum, a new Item is airdropped to its wallet.</p>
              <Button className="mr-5 pointer-events-auto" variant="calm">
                <span className="pr-2">Learn More</span><FontAwesomeIcon icon={ faLightbulb} />
              </Button>
              <Link href="/vote">
                <Button variant="primary" className="pointer-events-auto">
                  Vote Now
                  <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                </Button>
              </Link>
            </div>
            <NFTSnippets />
          </div>
          <div className="px-4 py-12 mx-auto text-center lg:px-36">
            <span className="font-semibold text-gray-400 uppercase block pb-6">Numbers</span>
            <NftFeed priceFeeds={ nftFeedData } />
            <Link href="/statistics">
              <Button variant="calm" className="my-8" href="">
                See all Statistics
                <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
              </Button>
            </Link>
          </div>
      </section>
    </>
  )
}

Home.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>
}

export default Home
