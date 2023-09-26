import type { PalletReferendaReferendumInfoConvictionVotingTally } from "@polkadot/types/lookup";
import { StorageKey, u32, Option } from "@polkadot/types";
import { NextResponse, NextRequest } from "next/server";
import { SubstrateChain } from "@/types/index";
import { getChainByName } from "@/config/chains";
import { getReferenda } from "@/app/[chain]/vote/get-referenda";

// function that handles post requests from the client
export async function POST(req: NextRequest) {
  // read the post body as json
  let { chain, refIndex }: { chain: SubstrateChain; refIndex: string } =
    await req.json();
  const chainConfig = await getChainByName(chain);
  const { api } = chainConfig;

  if (!api) {
    throw `can not get api of ${chain}`;
  }

  const refIndexInt = parseInt(refIndex);

  // declare a variable to hold the result which is either a singleVote or a list of votes,
  // delegated or direct
  let result;

  if (!isNaN(refIndexInt)) {
    // query the user votes for only that ref
    // ...
  } else {
    // you might want to get all ongoing referenda here via
    const ongoingRefs = getReferenda(chain);

    // ...
  }

  // and return the latest user vote or where they delegated as
  // as serializable json (aka strings, numbers, booleans, plain objects, arrays, etc.)
  return NextResponse.json({});
}
