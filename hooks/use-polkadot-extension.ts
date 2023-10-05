"use client";

import {
  InjectedAccountWithMeta,
  InjectedExtension,
} from "@polkadot/extension-inject/types";
import { useEffect, useState } from "react";
import { documentReadyPromise } from "./utils";
import { useAppStore } from "@/app/zustand";
import { stat } from "fs";

export interface UsePolkadotExtensionReturnType {
  extensionSetup: () => void;
  isExtensionReady: boolean;
}

export const usePolkadotExtension = () => {
  const chain = useAppStore((state) => state.chain);
  const user = useAppStore((state) => state.user);
  const { accounts, actingAccountIdx, isExtensionReady } = user;
  const setExtensions = useAppStore((state) => state.setExtensions);
  const setIsExtensionReady = useAppStore((state) => state.setIsExtensionReady);
  const setAccounts = useAppStore((state) => state.setAccounts);
  const setActingAccountSigner = useAppStore(
    (state) => state.setActingAccountSigner
  );
  const setAccountIdx = useAppStore((state) => state.setAccountIdx);
  const actingAccount = accounts && accounts[actingAccountIdx];
  const [isChainApiLoading, setIsChainApiLoading] = useState<boolean>(false);

  const extensionSetup = async () => {
    const extensionDapp = await import("@polkadot/extension-dapp");
    const { web3AccountsSubscribe, web3Enable, web3FromAddress } =
      extensionDapp;
    const injectedPromise = documentReadyPromise(() =>
      web3Enable(process.env.NEXT_PUBLIC_APP_NAME || "Polkadot Multi Chain App")
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
      if (actingAccount && actingAccount.address) {
        const { signer } = await web3FromAddress(actingAccount.address);
        setActingAccountSigner(signer);
      }
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

  useEffect(() => {
    // This effect is used to setup the browser extension
    // if (!isExtensionReady) {
    //   extensionSetup();
    // }
    if (!accounts) {
      extensionSetup();
    }
  }, [isExtensionReady, accounts]);

  // useEffect(() => {
  //   const asyncEffect = async () => {
  //     const extensionDapp = await import("@polkadot/extension-dapp");
  //     const { web3FromAddress } = extensionDapp;

  //     if (actingAccount && actingAccount.address) {
  //       const { signer } = await web3FromAddress(actingAccount.address);
  //       setActingAccountSigner(signer);
  //     }
  //   };
  //   if (isExtensionReady) {
  //     asyncEffect();
  //   }
  // }, [actingAccountIdx, accounts, isExtensionReady]);

  return { extensionSetup, isExtensionReady };
};
