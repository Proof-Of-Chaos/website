import Link from "next/link";
import { NextSeo } from "next-seo";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLightbulb } from "@fortawesome/free-solid-svg-icons";

import { websiteConfig } from "../data/website-config";
import Button from "../components/ui/button";
import Layout from "../layouts/layout";
import { nftFeedData } from "../data/nft-feed-data";
import NftFeed from "../components/nft/nft-stats";
import NFTSnippets from "../components/nft/nft-snippets";
import { RewardsCreationForm } from "../components/ui/rewards-creation/rewards-creation-form";

function ReferendumRewards() {
  return (
    <>
      <NextSeo title="ReferendumRewards" />
      <section className="w-full flex-col py-20 px-5 sm:px-10 md:px-5">
        <RewardsCreationForm />
      </section>
    </>
  );
}

ReferendumRewards.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

// export const getServerSideProps = async () => {
//   const { generateCalls } = await import(
//     "./api/nft_sendout_script/src/generateCalls"
//   );
//   const preimage = await generateCalls(defaultConfig);
//   // console.log("done", preimage)
//   return { props: { test: "123" } };
// };

export default ReferendumRewards;
