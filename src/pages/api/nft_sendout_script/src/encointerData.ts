import {
  EncointerCommunity,
  EncointerMetadata,
  ParaInclusions,
} from "../types.js";
import {
  getApiAt,
  getApiEncointer,
  getApiKusama,
} from "../../../../data/chain";
import { u8aToU8a } from "@polkadot/util";

/**
 * Retrieves the latest Encointer ceremony index.
 * @param block - The block number to query at.
 * @returns The latest ceremony index as a number.
 */
export const getLatestEncointerCeremony = async (
  block: number
): Promise<number> => {
  const api = await getApiAt("encointer", block);
  const latestCeremonyIndex =
    await api.query.encointerScheduler.currentCeremonyIndex();
  return parseInt(latestCeremonyIndex.toString());
};

/**
 * Retrieves the reputation lifetime value from the Encointer chain.
 * @param block - The block number to query at.
 * @returns The reputation lifetime value as a number.
 */
export const getReputationLifetime = async (block: number): Promise<number> => {
  const api = await getApiAt("encointer", block);
  const reputationLifetime =
    await api.query.encointerCeremonies.reputationLifetime();
  return parseInt(reputationLifetime.toString());
};

/**
 * Retrieves the ceremony attendants for a given community and ceremony index.
 * @param community - The Encointer community object.
 * @param ceremonyIndex - The index of the ceremony to query.
 * @param block - The block number to query at.
 * @returns An array of participant addresses as strings.
 */
export const getCeremonyAttendants = async (
  community: EncointerCommunity,
  ceremonyIndex: number,
  block: number
): Promise<string[]> => {
  const api = await getApiAt("encointer", block);
  const communityIdentifier = api.registry.createType("CommunityIdentifier", {
    geohash: api.registry.createType("GeoHash", u8aToU8a(community.geoHash)),
    digest: api.registry.createType("CidDigest", u8aToU8a(community.digest)),
  });
  const communityIdentifierWithCeremonyIndex = [
    communityIdentifier,
    ceremonyIndex,
  ];
  const participants =
    await api.query.encointerCeremonies.participantReputation.entries(
      communityIdentifierWithCeremonyIndex
    );
  const participantAddresses = participants.reduce(
    (walletAddresses, currentValue, index) => {
      if (
        currentValue[1].toHuman() === "VerifiedLinked" ||
        currentValue[1].toHuman() === "VerifiedUnlinked"
      ) {
        walletAddresses.push(participants[index][0].toHuman()[1]);
      }
      return walletAddresses;
    },
    []
  );

  return participantAddresses;
};

/**
 * Retrieves the Encointer block number corresponding to a given Kusama block number.
 * @param kusamaBlockNumber - The Kusama block number.
 * @returns The Encointer block number as a number or null if not found.
 */
export const getEncointerBlockNumberFromKusama = async (
  kusamaBlock: number
): Promise<number | null> => {
  const kusamaApi = await getApiKusama();
  const encointerApi = await getApiEncointer();
  const blockHash = await kusamaApi.rpc.chain.getBlockHash(kusamaBlock);
  const block = await kusamaApi.rpc.chain.getBlock(blockHash);
  const paraInherentExtrinsic = block.block.extrinsics.find(
    (extrinsic) =>
      extrinsic.method.section === "paraInherent" &&
      extrinsic.method.method === "enter"
  );

  if (!paraInherentExtrinsic) {
    return null;
  }
  const paraInclusions =
    paraInherentExtrinsic.args[0].toJSON() as unknown as ParaInclusions;
  const backedCandidates = paraInclusions.backedCandidates;

  const encointerParaId = 1001;
  let encointerBlockHeaderHash = null;

  for (const candidate of backedCandidates) {
    if (candidate.candidate.descriptor.paraId === encointerParaId) {
      encointerBlockHeaderHash = candidate.candidate.descriptor.paraHead;
      break;
    }
  }
  const encointerBlockHeader = await encointerApi.rpc.chain.getHeader(
    encointerBlockHeaderHash
  );
  const encointerBlockNumber = encointerBlockHeader.number.toNumber();
  return encointerBlockNumber;
};

/**
 * Get the current list of Encointer communities at a specific block.
 *
 * @param block - The block number to query the communities.
 * @returns - A Promise that resolves to an array of EncointerCommunity objects.
 */
export const getCurrentEncointerCommunities = async (
  block: number
): Promise<EncointerCommunity[]> => {
  // Get the Encointer API instance at the specified block
  const api = await getApiAt("encointer", block);

  // Query the Encointer communities' metadata
  const communityMetadata =
    await api.query.encointerCommunities.communityMetadata.entries();

  // Map the metadata to an array of EncointerCommunity objects
  const communities: EncointerCommunity[] = communityMetadata.map(
    ([key, value]) => {
      const decodedKey = key.toHuman();
      const metadata: EncointerMetadata = JSON.parse(
        JSON.stringify(value.toHuman())
      );
      return {
        geoHash: decodedKey[0].geohash,
        digest: decodedKey[0].digest,
        name: metadata.name,
        symbol: metadata.symbol,
      };
    }
  );

  // Return the array of EncointerCommunity objects
  return communities;
};
