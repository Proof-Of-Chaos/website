import { DEFAULT_CHAIN, CHAINS_ENABLED, getChainByName } from "@/config/chains";
import { ChainConfig, SubstrateChain } from "@/types";
import { getOngoingReferenda } from "./get-referenda";
import { getTracks } from "./get-tracks";
import ReferendumList from "./components/referendum-list";

export async function generateStaticParams() {
  const params: { chain: SubstrateChain }[] = [];

  Object.values(CHAINS_ENABLED).forEach((chain: ChainConfig) => {
    params.push({ chain: chain.name as SubstrateChain });
  });

  return params;
}

export default async function PageVote({
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

  const referenda = await getOngoingReferenda(selectedChain);
  const tracks = await getTracks(selectedChain);

  return (
    <>
      <ReferendumList
        referenda={referenda}
        tracks={tracks}
        chain={chain as SubstrateChain}
      />
    </>
  );
}
