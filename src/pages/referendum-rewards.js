import Link from "next/link";
import { NextSeo } from "next-seo";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLightbulb } from "@fortawesome/free-solid-svg-icons";

import { websiteConfig } from "../data/website-config";
import Button from "../components/ui/button";
import Layout from "../layouts/layout";
import { nftFeedData } from "../data/nft-feed-data";
import NftFeed from "../components/nft/nft-feed";
import NFTSnippets from "../components/nft/nft-snippets";
import { RewardsCreationForm } from "../components/ui/rewards-creation/rewards-creation-form";

function ReferendumRewards({ test }) {
  return (
    <>
      <NextSeo title="ReferendumRewards" />
      <section className="w-full flex-col py-20 px-5 sm:px-10 md:px-5">
        <h1 className="text-2xl">Create Rewards for a Referendum</h1>
        <p>Here you can create ... {test}</p>
        <RewardsCreationForm />
      </section>
    </>
  );
}

export const testConfig = {
  refIndex: 99,
  min: "1200000000000",
  max: "100000000000000000000000000000000000000000",
  first: null,
  blockCutOff: null,
  directOnly: true,
  createNewCollection: true,
  newCollectionSymbol: 99,
  newCollectionPath: "/public/collections",
  newCollectionFile: "test.png",
  newCollectionName: "test for ref 99",
  newCollectionDescription: "Test Description",
  babyBonus: 7,
  toddlerBonus: 13,
  adolescentBonus: 16,
  adultBonus: null,
  quizBonus: 20,
  identityBonus: null,
  encointerBonus: 50,
  minAmount: 0.2,
  defaultRoyalty: 95,
  options: [
    {
      maxProbability: 25,
      minProbability: 3,
      transferable: 1,
      symbol: "E99",
      text: "'Epic'\n\nI voted on Ref 99 and got an epic NFT",
      artist: "Picasso",
      creativeDirector: "Joe Biden",
      main: "99/epic/main.png",
      thumb: "99/epic/thumb.png",
      rarity: "epic",
      itemName: "Epic",
      minRoyalty: 25,
      maxRoyalty: 35,
    },
    {
      maxProbability: 40,
      minProbability: 10,
      transferable: 1,
      symbol: "R99",
      text: "'Rare'\n\nI voted on Ref 99 and got a rare NFT",
      artist: "Dali",
      creativeDirector: "Amadeus Mozart",
      main: "99/rare/main.png",
      thumb: "99/rare/thumb.png",
      rarity: "rare",
      itemName: "Rare",
      minRoyalty: 20,
      maxRoyalty: 30,
    },
    {
      maxProbability: null,
      minProbability: null,
      transferable: 1,
      symbol: "C99",
      text: "'Common'\n\nI voted on Ref 99 and got a common NFT",
      artist: "van Gogh",
      creativeDirector: "da Vinci",
      main: "99/common/main.png",
      thumb: "99/common/thumb.png",
      rarity: "common",
      itemName: "Common",
      minRoyalty: 15,
      maxRoyalty: 25,
    },
  ],
};

ReferendumRewards.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

// export const getServerSideProps = async () => {
//   const { generateCalls } = await import(
//     "./api/nft_sendout_script/src/generateCalls"
//   );
//   const preimage = await generateCalls(testConfig);
//   console.log("done", preimage);
//   return { props: { test: "123" } };
// };

export default ReferendumRewards;
