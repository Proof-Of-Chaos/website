import Head from 'next/head'
import Image from 'next/image'
import FAQ from '../components/ui/faq'
import Team from '../components/ui/team'
import Layout from '../layouts/layout'
import Roadmap from '../components/ui/roadmap'

function About() {
  return (
    <>
      <section className="w-full px-8 py-8 pt-16 xl:px-0">
        <div className="flex flex-col max-w-6xl mx-auto md:flex-row">
          <div className="w-full pr-5 md:w-3/12 xl:pr-12">
            <h3 className="text-3xl font-bold leading-7">Our mission</h3>
          </div>

          <div className="w-full mt-5 md:mt-0 md:w-4/5 md:pl-2">
            <p className="text-base font-normal text-gray-700">
              Through increased participation in our governance systems, we are making the network more secure and resilient to attacks. We have designed a system where we actively incentivise more users to make educated votes with more funds. Read below how that looks in practice.
            </p>
          </div>
        </div>
      </section>
      <section className="w-full px-8 py-8 xl:px-0">
        <div className="flex flex-col max-w-6xl mx-auto md:flex-row">
          <div className="w-full pr-5 md:w-3/12 xl:pr-12">
            <h3 className="text-3xl font-bold leading-7">How we do it</h3>
          </div>
          <div className="w-full mt-5 md:mt-0 md:w-4/5 md:pl-2">
            <h4 className=" font-bold">Free NFTs</h4>
            <p className="text-base font-normal text-gray-700">
            We incentivise governance participation by air-dropping free NFTs to all voters for each referendum.
            </p>
            <h4 className=" font-bold pt-4">Bigger vote = rarer NFT</h4>
            <p className="text-base font-normal text-gray-700">
            For each referendum there are multiple types of NFTs with different rarities that voters will receive. The type of NFT each voter will receive depends on a “luck factor”. This “luck factor” can be influenced by a voter to a given extent. Votes with a higher vote amount (considering conviction) are more likely to receive one of the rarer NFTs.
            </p>
            <h4 className=" font-bold pt-4">Educated vote = rarer NFT</h4>
            <p className="text-base font-normal text-gray-700">
            Another way to increase your chance at the rarer NFTs is by correctly answering the referendum quiz on this site. Getting all answers correct gives voters a luck boost! We want to encourage educated votes!
            </p>
            <h4 className=" font-bold pt-4">Minimum voting requirement</h4>
            <p className="text-base font-normal text-gray-700">
            Voters that do not meet the minimum KSM vote requirements will receive the least rare NFTs with a 90% royalty. Conviction is of course considered and thus even a very small holder can easily meet the minimum requirement by locking up their funds for longer periods. The idea behind the minimum requirement is to discourage users from voting with many wallets and very little funds on each.
            </p>
          </div>
        </div>
      </section>
      <section className="w-full px-8 py-8 xl:px-0">
        <div className="flex flex-col max-w-6xl mx-auto md:flex-row">
          <div className="w-full pr-5 md:w-3/12 xl:pr-12">
            <h3 className="text-3xl font-bold leading-7">Utility</h3>
          </div>
          <div className="w-full mt-5 md:mt-0 md:w-4/5 md:pl-2">
            <p className="text-base font-normal text-gray-700">
            These NFTs are a visual representation of a wallets on-chain participation in Kusama governance. It would not be surprising to see Kusama projects and parachains integrate special rewards for NFT recipients. For more information on how to integrate the NFTs into your project and the associated benefits, please read <a href="https://docs.google.com/document/d/1KYYT1owxbUnUZq2aO1IxYyLxbTOnGZ2Vj_P2i-zVsFA/edit?usp=sharing">here</a>. We are soon launching a soul-bound collection that should make integration even easier for projects wishing to further reward voters.
            </p>
          </div>
        </div>
      </section>
      <Roadmap />
      <FAQ />
      <Team/>
    </>
  )
}

About.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>
}

export default About
