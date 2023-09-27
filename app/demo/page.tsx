"use client";

import { title, vividButtonClasses } from "@/components/primitives";
import { Tab } from "@nextui-org/tabs";
import React from "react";
import { Button } from "@nextui-org/button";
import clsx from "clsx";
import { Progress } from "@nextui-org/progress";
import { Card, CardBody, CardFooter } from "@nextui-org/card";
import { sendAndFinalize, streamToJSON } from "@/components/util-client";
import { useSubstrateChain } from "@/context/substrate-chain-context";
import { useAppStore } from "../zustand";
export const revalidate = 3600;

export default function DemoPage() {
  const { activeChain } = useSubstrateChain();
  const user = useAppStore((state) => state.user);
  const { actingAccountSigner, actingAccount } = user;

  async function sendAndFinalizeSth() {
    try {
      const res = await sendAndFinalize(
        activeChain?.assetHubApi,
        activeChain?.assetHubApi?.tx.balances.transfer(
          "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
          12345
        ),
        actingAccountSigner,
        actingAccount?.address
      );
      if (res.status !== "error") console.log("successful send", res);
    } catch (e) {
      console.log("error send", e);
    }
  }

  return (
    <div>
      <h1 className={title({ siteTitle: true })}>Demo</h1>
      <Button onClick={sendAndFinalizeSth}>Test SendAndFinalize</Button>
    </div>
  );
}
