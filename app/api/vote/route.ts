import { NextResponse, NextRequest } from "next/server";
import { SubstrateChain, UserVotesReturnType } from "@/types/index";
import { getChainByName } from "@/config/chains";
import { getUserVotes } from "@/app/api/vote/get-user-votes";

// api that returns
export async function POST(req: NextRequest) {
  // read the post body as json
  let {
    chain,
    referendaFilter = "ongoing",
    userAddress,
  }: {
    chain: SubstrateChain;
    referendaFilter: string;
    userAddress: string;
  } = await req.json();

  console.log("server route /api/vote", chain, referendaFilter);

  const chainConfig = await getChainByName(chain);
  const { api } = chainConfig;

  if (!api) {
    throw `can not get api of ${chain}`;
  }

  // declare a variable to hold the result which is either a singleVote or a list of votes,
  // delegated or direct
  let result: UserVotesReturnType;
  result = await getUserVotes(chain, userAddress, referendaFilter);

  // and return the latest user vote or where they delegated as
  // as serializable json (aka strings, numbers, booleans, plain objects, arrays, etc.)
  return NextResponse.json(result);
}
