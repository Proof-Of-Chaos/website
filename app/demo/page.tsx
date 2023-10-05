"use client";

import { title, vividButtonClasses } from "@/components/primitives";
import { Tab } from "@nextui-org/tabs";
import React from "react";
import { Button } from "@nextui-org/button";
import clsx from "clsx";
import { Progress } from "@nextui-org/progress";
import { Card, CardBody, CardFooter } from "@nextui-org/card";
import { sendAndFinalize, streamToJSON } from "@/components/util-client";
import { useAppStore } from "../zustand";
import { usePolkadotApis } from "@/context/polkadot-api-context";
export const revalidate = 3600;

export default function DemoPage() {
  const {
    activeChainName,
    apiStates: { assetHub },
  } = usePolkadotApis();
  const user = useAppStore((state) => state.user);
  const { actingAccountSigner, actingAccount } = user;

  async function sendAndFinalizeSth() {
    try {
      const res = await sendAndFinalize(
        assetHub?.api,
        assetHub?.api?.tx.balances.transfer(
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
