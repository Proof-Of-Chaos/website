import { ApiPromise } from "@polkadot/api";
import PinataClient from "@pinata/sdk";
import { BN } from "@polkadot/util";
import { RuntimeDispatchInfo } from "@polkadot/types/interfaces";
import { TxTypes } from "@/components/util-client";
import { RewardConfiguration } from "@/app/[chain]/referendum-rewards/types";
import { pinImageAndMetadataForCollection } from "../_pinata-utils";
import { ApiCache } from "@/config/chains/ApiCache";
import { SubstrateChain } from "@/types";

export const getUserLatestCollectionId = async (
  apiAssetHub: ApiPromise,
  address: string
): Promise<string> => {
  const allUserCollections =
    await apiAssetHub.query.nfts.collectionAccount.keys(address);
  const collectionIds: BN[] = allUserCollections.map(
    ({ args: [, collectionId] }) => new BN(collectionId.toString())
  );
  //loop over user collections and get collection with highest ID -> latest created
  return collectionIds
    .reduce((max, current) => (max.gt(current) ? max : current))
    .toString();
};

/**
 * Get the txs for setting the metadata for a collection
 * @param apiAssetHub
 * @param apiPinata
 * @param config
 * @returns
 */
export const getTxsCollectionSetMetadata = async (
  apiAssetHub: ApiPromise,
  apiPinata: PinataClient,
  config: RewardConfiguration
): Promise<{
  txsAssetHub: TxTypes[];
}> => {
  let txsAssetHub = [];

  if (!config.collectionConfig.id)
    throw "getTxsCollectionSetMetadata needs a collection config id";

  config.collectionConfig.metadataCid = (
    await pinImageAndMetadataForCollection(apiPinata, config)
  ).metadataIpfsCid;

  const ipfsIdentifier = `ipfs://ipfs/${config.collectionConfig.metadataCid}`;

  txsAssetHub.push(
    apiAssetHub.tx.nfts.setCollectionMetadata(
      config.collectionConfig.id,
      ipfsIdentifier
    )
  );
  return { txsAssetHub };
};
