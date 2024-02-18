import { title } from "@/components/primitives";
import { Metadata } from "next";
import { DEFAULT_CHAIN } from "@/config/chains";
import { SubstrateChain } from "@/types";
import RewardsCreationForm from "./components/rewards-creation-form";
import { RococoInfo } from "./components/rococo-info";
import { RewardsInfo } from "./components/rewards-info";

export const metadata: Metadata = {
  title: "Rewards",
  description:
    "Create NFT Rewards for OpenGov Referenda on Polkadot and Kusama",
};

export default async function PageRewards({
  params: { chain },
}: {
  params: {
    chain: string;
  };
}) {
  const selectedChain = Object.values(SubstrateChain).includes(
    chain as SubstrateChain
  )
    ? (chain as SubstrateChain)
    : DEFAULT_CHAIN;

  return (
    <div>
      <h1 className={title({ siteTitle: true })}>
        Rewards
        <span className="text-lg pl-4 bg-clip-text text-transparent bg-gradient-to-tr from-purple-600 to-blue-300">
          beta
        </span>
      </h1>
        <>
          {selectedChain === SubstrateChain.Rococo ? (
            <RococoInfo />
          ) : (
            <RewardsInfo />
          )}

          <RewardsCreationForm chain={selectedChain} />
        </>
    </div>
  );
}
