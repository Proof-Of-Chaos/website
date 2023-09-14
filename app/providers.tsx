"use client";

import React, { useEffect, useState } from "react";
import "@polkadot/api-augment";
import { NextUIProvider } from "@nextui-org/system";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes/dist/types";
import { QueryClient, QueryClientProvider } from "react-query";
import { useAppStore } from "./zustand";
import { documentReadyPromise } from "@/hooks/utils";

import { SubstrateChainProvider } from "@/context/substrate-chain-context";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const queryClient = new QueryClient();
  const chain = useAppStore((state) => state.chain);
  const user = useAppStore((state) => state.user);
  const { accounts, actingAccountIdx, isExtensionReady } = user;
  const setExtensions = useAppStore((state) => state.setExtensions);
  const setIsExtensionReady = useAppStore((state) => state.setIsExtensionReady);
  const setAccounts = useAppStore((state) => state.setAccounts);
  const setIsChainApiReady = useAppStore((state) => state.setIsChainApiReady);
  const setAccountIdx = useAppStore((state) => state.setAccountIdx);
  const actingAccount = accounts && accounts[actingAccountIdx];
  const [isChainApiLoading, setIsChainApiLoading] = useState<boolean>(false);

  // connect the api as early as possible
  // useEffect(() => {
  //   const connectApi = async () => {
  //     setIsChainApiReady(false);
  //     await switchChain(SubstrateChain.Kusama);
  //     setIsChainApiReady(true);
  //   };

  //   connectApi();
  // }, []);

  useEffect(() => {
    // This effect is used to setup the browser extension
    const extensionSetup = async () => {
      const extensionDapp = await import("@polkadot/extension-dapp");
      const { web3AccountsSubscribe, web3Enable } = extensionDapp;
      const injectedPromise = documentReadyPromise(() =>
        web3Enable(
          process.env.NEXT_PUBLIC_APP_NAME || "Polkadot Multi Chain App"
        )
      );
      const browserExtensions = await injectedPromise;

      console.log("extensions", browserExtensions);

      setExtensions(browserExtensions);

      if (browserExtensions.length === 0) {
        console.warn(
          "⚠️ No Polkadot compatible browser extension found, or the user did not accept the request"
        );
        return;
      }

      if (accounts.length > 0) {
        setIsExtensionReady(true);
      } else {
        let unsubscribe: () => void;

        // we subscribe to any account change
        // note that `web3AccountsSubscribe` returns the function to unsubscribe
        unsubscribe = await web3AccountsSubscribe((injectedAccounts) => {
          console.log("accounts", injectedAccounts);
          setIsExtensionReady(true);
          setAccounts(injectedAccounts);
        });

        return () => unsubscribe && unsubscribe();
      }
    };

    if (!isExtensionReady) {
      extensionSetup();
    }
  }, [isExtensionReady]);

  return (
    <NextUIProvider>
      <QueryClientProvider client={queryClient}>
        <SubstrateChainProvider>
          <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
        </SubstrateChainProvider>
      </QueryClientProvider>
    </NextUIProvider>
  );
}
