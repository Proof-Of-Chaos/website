import { WsProvider, ApiPromise } from "@polkadot/api";
import { getChainInfo } from ".";
import { ChainType, SubstrateChain } from "@/types";

class ApiContainer {
  api: ApiPromise | undefined = undefined;
  endpointIndex: number = 0;
  endpoints: string[];
  isConnected: boolean = false;

  constructor(api: ApiPromise | undefined, endpoints: string[]) {
    this.api = api;
    this.endpoints = endpoints;

    (async () => {
      if (this.api) {
        await this.api.isReady;
        this.isConnected = true;
      }
    })();
  }

  public nextEndpoint(): string {
    this.endpointIndex = (this.endpointIndex + 1) % this.endpoints.length;
    return this.endpoints[this.endpointIndex];
  }
}

class DoubleIndexedMap {
  private cache: Map<SubstrateChain, Map<ChainType, ApiContainer>> = new Map();

  set(
    chainName: SubstrateChain,
    chainType: ChainType,
    apiContainer: ApiContainer
  ) {
    if (!this.cache.has(chainName)) {
      this.cache.set(chainName, new Map());
    }
    this.cache.get(chainName)!.set(chainType, apiContainer);
  }

  get(
    chainName: SubstrateChain,
    chainType: ChainType
  ): ApiContainer | undefined {
    return this.cache.has(chainName)
      ? this.cache.get(chainName)!.get(chainType)
      : undefined;
  }
}

class ApiCache {
  private static apiCache = new DoubleIndexedMap();

  private static async createApi(
    chainName: SubstrateChain,
    chainType: ChainType,
    eventHandlers: any
  ): Promise<ApiContainer> {
    const endpoints =
      getChainInfo(chainName).endpoints[chainType]?.map(
        (endpoint) => endpoint.url
      ) || [];

    const provider = new WsProvider(endpoints[0]);
    const api = new ApiPromise({ provider });

    api.on("connected", eventHandlers.connectedHandler);
    api.on("disconnected", () =>
      eventHandlers.disconnectedHandler(chainName, chainType)
    );
    api.on("error", (error) =>
      eventHandlers.errorHandler(chainName, chainType, error)
    );

    await api.isReady;

    return new ApiContainer(api, endpoints);
  }

  private static async reconnect(
    apiContainer: ApiContainer,
    chainName: SubstrateChain,
    chainType: ChainType,
    eventHandlers: any
  ) {
    const nextEndpoint = apiContainer?.nextEndpoint();
    const newApiContainer = await this.createApi(
      chainName,
      chainType,
      eventHandlers
    );
    this.apiCache.set(chainName, chainType, newApiContainer);
  }

  private static eventHandlers = {
    connectedHandler: () => {
      // Handle connection logic if needed.
    },
    disconnectedHandler: (
      chainName: SubstrateChain,
      chainType: ChainType,
      apiContainer: ApiContainer
    ) => {
      console.log("disconnected", chainName, chainType);
      this.reconnect(apiContainer, chainName, chainType, this.eventHandlers);
    },
    errorHandler: (
      chainName: SubstrateChain,
      chainType: ChainType,
      apiContainer: ApiContainer,
      error: Error
    ) => {
      console.log("disconnected", chainName, chainType);
      this.reconnect(apiContainer, chainName, chainType, this.eventHandlers);
    },
  };

  static async getApis(chainName: SubstrateChain): Promise<{
    [key in ChainType]: ApiContainer | undefined;
  }> {
    let relayApiContainer = this.apiCache.get(chainName, "relay");
    if (!relayApiContainer) {
      relayApiContainer = await this.createApi(
        chainName,
        "relay",
        this.eventHandlers
      );
      this.apiCache.set(chainName, "relay", relayApiContainer);
    }

    let assetHubApiContainer = this.apiCache.get(chainName, "assetHub");
    if (!assetHubApiContainer) {
      assetHubApiContainer = await this.createApi(
        chainName,
        "assetHub",
        this.eventHandlers
      );
      this.apiCache.set(chainName, "assetHub", assetHubApiContainer);
    }

    return {
      relay: relayApiContainer,
      assetHub: assetHubApiContainer,
      bridgeHub: undefined,
    };
  }
}

export { ApiCache };
