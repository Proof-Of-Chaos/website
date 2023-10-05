export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Proof of Chaos",
  description: "Incentivizing voting on Polkadot and Kusama",
  navItems: [
    {
      label: "About",
      href: "/about",
    },
    {
      label: "NFTs",
      href: "/nfts",
    },
    {
      label: "Vote",
      href: "/vote",
      chainLink: true,
    },
    {
      label: "Rewards",
      href: "/referendum-rewards",
      chainLink: true,
    },
  ],
  navMenuItems: [
    {
      label: "About",
      href: "/about",
    },
    {
      label: "NFTs",
      href: "/nfts",
    },
    {
      label: "Vote",
      href: "/vote",
      chainLink: true,
    },
    {
      label: "Rewards",
      href: "/referendum-rewards",
      chainLink: true,
    },
  ],
  links: {
    github: "https://github.com/Proof-Of-Chaos/website",
    twitter: "https://twitter.com/GovPartRewKSM",
    discord: "https://discord.gg/raMucevj",
  },
};
