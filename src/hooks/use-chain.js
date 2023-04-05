import { useQuery } from '@tanstack/react-query'
import { useEffect } from "react";
import { getApi } from "../data/chain";
import useAppStore from "../zustand";
import { useIsMounted } from "./use-is-mounted";

/**
 * Subscribe to the chain head and set the zustand to contain theblocknumber
 */
function useSubscribeChainHead() {
  const isMounted = useIsMounted();
  const setCurrentBlock = useAppStore((state) => state.setCurrentBlock)

  useEffect(() => {
    const subscribeToHead = async() => {
      const api = await getApi();
      api?.rpc.chain.subscribeNewHeads((header) => {
        const latestUnFinalizedHeight = header.number;
        if (isMounted) {
          setCurrentBlock (latestUnFinalizedHeight);
        }
      });
    }
    subscribeToHead()

  }, [isMounted, setCurrentBlock]);
}

export {
  useSubscribeChainHead,
}