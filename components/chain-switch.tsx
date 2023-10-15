"use client";

import { ChainConfig, SubstrateChain } from "@/types";
import clsx from "clsx";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown";
import { Spinner } from "@nextui-org/spinner";
import { Button } from "@nextui-org/button";
import { Key, useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CHAINS_ENABLED, getChainInfo } from "@/config/chains";
import { usePolkadotApis } from "@/context/polkadot-api-context";
import { getChain } from "@/app/vote/server-actions/get-chain";

export const ChainSwitch = ({ className }: { className?: string }) => {
  const router = useRouter();
  const pathname = usePathname();
  // const { activeChain, setActiveChainName, isConnecting } = useSubstrateChain();

  const { apiStates, activeChainName, switchChain } = usePolkadotApis();

  const relayApiState = apiStates?.relay;
  const activeChainInfo = getChainInfo(activeChainName);

  const pathContainsSubstrateChain = Object.values(SubstrateChain).some(
    (chain) => pathname.includes(`/${chain}/`)
  );

  const selectedChain = Object.values(SubstrateChain).find((substrateChain) =>
    pathname.includes(`/${substrateChain}/`)
  );

  useEffect(() => {
    if (selectedChain) {
      switchChain(selectedChain, "relay");
    }
  }, [selectedChain]);

  const handleChainChange = (key: Key) => {
    const newChain = key as SubstrateChain;

    if (pathContainsSubstrateChain) {
      // find selected chain from pathname that can contain any SubstrateChain
      // and replace the path in case we are on a route with a chain in it

      if (selectedChain) {
        const newPathname = pathname.replace(
          `/${selectedChain}/`,
          `/${newChain}/`
        );
        switchChain(newChain, "relay");
        router.replace(newPathname);
      }
    } else {
      switchChain(newChain, "relay");
    }
  };

  return (
    <div className={className}>
      <Dropdown
        placeholder="Select your Chain"
        className="md:max-w-xs"
        size="sm"
      >
        <DropdownTrigger>
          <Button
            variant="bordered"
            size="lg"
            isIconOnly={false}
            className="min-w-unit-12 px-unit-1 md:px-unit-4"
          >
            {!relayApiState?.isConnected ||
            typeof activeChainName === "undefined" ? (
              <span className="text-xs flex items-center">
                <Spinner size="sm" color="secondary" className="mr-2" />
              </span>
            ) : (
              <activeChainInfo.icon />
            )}
            <span className="hidden md:flex">{activeChainName}</span>
          </Button>
        </DropdownTrigger>
        <DropdownMenu onAction={handleChainChange} aria-label="Select Chain">
          {Object.values(CHAINS_ENABLED).map((chain) => (
            <DropdownItem
              key={chain.name}
              value={chain.name}
              startContent={<chain.icon />}
            >
              {chain.name}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};
