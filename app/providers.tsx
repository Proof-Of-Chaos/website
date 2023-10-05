"use client";

import React from "react";
import "@polkadot/api-augment";
import { NextUIProvider } from "@nextui-org/system";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes/dist/types";
import { QueryClient, QueryClientProvider } from "react-query";
import { PolkadotApisProvider } from "@/context/polkadot-api-context";

import dynamic from "next/dynamic";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const queryClient = new QueryClient();

  const DynamicPolkadotExtensionProvider = dynamic(
    () =>
      import("../context/polkadot-extension-context").then(
        (mod) => mod.PolkadotExtensionProvider
      ),
    {
      ssr: false,
    }
  );

  return (
    <NextUIProvider>
      <QueryClientProvider client={queryClient}>
        <DynamicPolkadotExtensionProvider>
          {/* <SubstrateChainProvider> */}
          {/* <SubstrateChainProviderNew> */}
          {/* <ApiProvider> */}
          <PolkadotApisProvider>
            <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
          </PolkadotApisProvider>
          {/* </ApiProvider> */}
          {/* </SubstrateChainProviderNew> */}
          {/* </SubstrateChainProvider> */}
        </DynamicPolkadotExtensionProvider>
      </QueryClientProvider>
    </NextUIProvider>
  );
}
