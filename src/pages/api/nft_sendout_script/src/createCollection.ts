import { ApiPromise } from "@polkadot/api";
import {
    CollectionConfiguration, RewardConfiguration
} from "../types";
import PinataClient from "@pinata/sdk";
import { pinImageAndMetadataForCollection } from "../tools/pinataUtils";

export const getTxsCollectionCreate = async (
    apiKusamaAssetHub: ApiPromise,
    apiPinata: PinataClient,
    config: RewardConfiguration,
): Promise<{
    txsKusamaAssetHub: any[];
}> => {
    let txsKusamaAssetHub = [];
    console.log("getting collection create call");
    //create collection
    txsKusamaAssetHub.push(apiKusamaAssetHub.tx.nfts.create());
    return { txsKusamaAssetHub };
}

export const getTxsCollectionSetMetadata = async (
    apiKusamaAssetHub: ApiPromise,
    apiPinata: PinataClient,
    config: RewardConfiguration,
): Promise<{
    txsKusamaAssetHub: any[];
}> => {
    let txsKusamaAssetHub = [];
    console.log("getting collection create call");
    config.newCollectionConfig.metadataCid = (await pinImageAndMetadataForCollection(
        apiPinata,
        config.newCollectionConfig
    )).metadataIpfsCid;
    //create collection
    txsKusamaAssetHub.push(apiKusamaAssetHub.tx.nfts.setMetadata(config.collectionId, config.newCollectionConfig.metadataCid));
    return { txsKusamaAssetHub };
}
