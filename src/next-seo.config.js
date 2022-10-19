const seoConfig = {
  titleTemplate: '%s | Proof of Chaos | NFTs for voting on Kusama',
  description: 'Each time a wallet votes on a Referendum, a new Item is airdropped to its wallet, free, tradable, collectable.',
  additionalMetaTags: [{
    property: 'keywords',
    content: 'Governance, Kusama, NFT'
  }, {
    property: 'viewport',
    content: 'width=device-width, initial-scale=1 maximum-scale=1'
  }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://proofofchaos.app/',
    title: 'Proof of Chaos',
    description: 'Incentivizing voting on Kusama, receive NFTs that you can collect and trade for each vote',
    images: [
      {
        url: 'https://proofofchaos.app/proof-of-chaos.png',
        width: 1200,
        height: 601,
        alt: 'Proof of Chaos Landing page',
      },
    ],
  },
  twitter: {
    site: '@GovPartRewKSM',
    cardType: 'summary_large_image',
  },
}

export default seoConfig