import { ApiPromise } from "@polkadot/api";
import { RewardConfiguration } from "../types";
import PinataClient from "@pinata/sdk";
import { pinImageAndMetadataForCollection } from "../tools/pinataUtils";
import { BN } from "@polkadot/util";

export const getTxsCollectionCreate = async (
    apiKusamaAssetHub: ApiPromise,
    rewardConfig: RewardConfiguration
): Promise<{
    txsKusamaAssetHub: any[];
}> => {
    let txsKusamaAssetHub = [];
    console.log("getting collection create call");
    //create collection
    const admin = {
        Id: rewardConfig.sender,
    };
    const config = {
        max_supply: null,
        mint_settings: {
            default_item_settings: 0,
            end_block: null,
            mint_type: "Issuer",
            price: null,
            start_block: null,
        },
        settings: 0,
    };
    txsKusamaAssetHub.push(apiKusamaAssetHub.tx.nfts.create(admin, config));
    return { txsKusamaAssetHub };
};

export const getUserLatestCollectionId = async (
    apiKusamaAssetHub: ApiPromise,
    address: string
): Promise<string> => {
    const allUserCollections = await apiKusamaAssetHub.query.nfts.collectionAccount.keys(
        address,
    );
    const collectionIds: BN[] = allUserCollections
        .map(({ args: [, collectionId, nftId] }) => new BN(collectionId.toString()));
    //loop over user collections and get collection with highest ID -> latest created
    return collectionIds.reduce((max, current) => max.gt(current) ? max : current).toString();
}

export const getTxsCollectionSetMetadata = async (
    apiKusamaAssetHub: ApiPromise,
    apiPinata: PinataClient,
    config: RewardConfiguration
): Promise<{
    txsKusamaAssetHub: any[];
}> => {
    let txsKusamaAssetHub = [];
    console.log("getting collection create call");
    config.newCollectionConfig.metadataCid = (
        await pinImageAndMetadataForCollection(
            apiPinata,
            config.newCollectionConfig
        )
    ).metadataIpfsCid;
    //create collection
    txsKusamaAssetHub.push(
        apiKusamaAssetHub.tx.nfts.setMetadata(
            config.collectionId,
            config.newCollectionConfig.metadataCid
        )
    );
    return { txsKusamaAssetHub };
};
