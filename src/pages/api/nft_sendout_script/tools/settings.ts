export const getSettings = () => {
  const settings = {
    network: {
      name: process.env.NETWORK_NAME,
      prefix: process.env.NETWORK_PREFIX,
      decimals: process.env.NETWORK_DECIMALS,
      token: process.env.NETWORK_TOKEN,
    },
    chunkSize: parseInt(process.env.CHUNK_SIZE),
    isTest: process.env.TEST === "true"
  };
  return settings;
};
