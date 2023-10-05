import { titleCase } from "@/components/util";
import { rewardsConfig } from "@/config/rewards";
import { ChainConfig, SubstrateChain } from "@/types";
import { decodeAddress, encodeAddress } from "@polkadot/keyring";
import { z } from "zod";
import { RewardCriteria, SendAndFinalizeResult } from "./types";

export async function executeAsyncFunctionsInSequence<T>(
  asyncFunctions: Array<() => Promise<T>>
) {
  let results: T[] = [];

  for (const asyncFunction of asyncFunctions) {
    const result = await asyncFunction();
    results.push(result);
  }

  return results;
}

export async function executeTxsInSequence(
  txs: Array<() => Promise<SendAndFinalizeResult>>,
  onPartFinished?: (result: SendAndFinalizeResult) => void
) {
  let results: SendAndFinalizeResult[] = [];

  for (const tx of txs) {
    const result = await tx();
    if (result.status === "error") {
      throw result;
    }
    onPartFinished && onPartFinished(result);
    results.push(result);
  }

  return results;
}
