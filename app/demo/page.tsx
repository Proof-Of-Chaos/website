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
import { useUserCollections } from "@/hooks/use-user-collections";
export const revalidate = 3600;

export default function DemoPage() {
  const {
    activeChainName,
    apiStates: { assetHub },
  } = usePolkadotApis();

  const { data, isLoading, isFetching } = useUserCollections();

  return (
    <div>
      <h1 className={title({ siteTitle: true })}>Demo</h1>
      haallo
      {(isLoading || isFetching) && <>loading</>}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
