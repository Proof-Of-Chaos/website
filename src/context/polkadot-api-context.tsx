import { createContext, useEffect, useState } from "react";
import { getApiKusama, getApiKusamaAssetHub } from "../data/chain";
import { ApiPromise } from "@polkadot/api";

export const PolkadotApiContext = createContext({
  apiKusama: null,
  apiKusamaAssetHub: null,
});

const PolkadotApiProvider = (props) => {
  const [apiKusama, setApiKusama] = useState<ApiPromise>();
  const [apiKusamaAssetHub, setApiKusamaAssetHub] = useState<ApiPromise>();

  useEffect(() => {
    (async () => {
      const api = await getApiKusama();
      setApiKusama(api);
    })().catch(console.error);

    (async () => {
      const api = await getApiKusamaAssetHub();
      setApiKusamaAssetHub(api);
    })().catch(console.error);
  });

  return (
    <PolkadotApiContext.Provider value={{ apiKusama, apiKusamaAssetHub }}>
      {props.children}
    </PolkadotApiContext.Provider>
  );
};

export default PolkadotApiProvider;
