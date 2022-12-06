import { createContext, useEffect, useState } from "react";
import { getApi } from "../data/chain";

export const PolkadotApiContext = createContext();

const PolkadotApiProvider = props => {
  const [ api, setApi ] = useState();

  useEffect(() => {
    const getPolkaApi = async () => {
      const api = await getApi()
      setApi( api )
    }

    getPolkaApi()
      .catch( console.error )
  })

  return (
    <PolkadotApiContext.Provider value={ { api } }>
      { props.children }
    </PolkadotApiContext.Provider>
  )
}

export default PolkadotApiProvider

