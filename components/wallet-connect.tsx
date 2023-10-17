"use client";

import { useAppStore } from "@/app/zustand";
import { useChainDetails } from "@/store/server/chain/queries";
import { Select, SelectItem } from "@nextui-org/select";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
} from "@nextui-org/dropdown";
import Identicon from "@polkadot/react-identicon";
import { Button } from "@nextui-org/button";
import { trimAddress } from "./util";
import { Key, useEffect, useState } from "react";
import UseCases from "@w3f/polkadot-icons/keyline/UseCases";
import Users from "@w3f/polkadot-icons/keyline/Users";
import { encodeAddress } from "@polkadot/keyring";
import ConnectWallet from "@w3f/polkadot-icons/keyline/ConnectWallet";
import Copy from "@w3f/polkadot-icons/keyline/Copy";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { usePolkadotExtension } from "@/context/polkadot-extension-context";
import { usePolkadotApis } from "@/context/polkadot-api-context";

export const WalletConnect = () => {
  const {
    isExtensionAvailable,
    accounts,
    selectedAccount,
    initiateConnection,
    userWantsConnection,
    setSelectedAccountIndex,
    disconnect,
  } = usePolkadotExtension();

  const { activeChainInfo } = usePolkadotApis();

  const { ss58Format } = activeChainInfo;
  const router = useRouter();

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleChange = (key: Key) => {
    if (["profile"].includes(key as string)) {
      router.push(`/${key}`);
      return;
    }
    const accountIdx = accounts?.findIndex(
      (account) => account.address === key
    );

    if (accountIdx >= 0) {
      setSelectedAccountIndex(accountIdx);
    }
  };

  if (!userWantsConnection) {
    return (
      <div className="max-w-xs">
        <Button
          onClick={initiateConnection}
          variant="bordered"
          size="lg"
          isIconOnly={true}
        >
          <ConnectWallet stroke="currentColor" width={20} height={20} />
        </Button>
      </div>
    );
  }

  if (!isExtensionAvailable)
    return (
      <Button variant="bordered" size="lg" isIconOnly={true}>
        <ConnectWallet stroke="currentColor" width={20} height={20} />
      </Button>
    );

  if (accounts.length === 0) return <p>No account found</p>;

  console.log("selectedAccount", selectedAccount?.address);

  return (
    <div className="max-w-xs">
      <Dropdown>
        <DropdownTrigger>
          <Button variant="bordered" size="lg" isIconOnly={true}>
            <Identicon
              value={selectedAccount?.address}
              size={30}
              theme="polkadot"
              className="hover:cursor-pointer"
              // prefix={ss58Prefix}
            />
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          variant="faded"
          aria-label="Account Select"
          onAction={handleChange}
        >
          <DropdownSection
            title="Accounts"
            showDivider
            className="max-h"
            classNames={{
              group: "max-h-72 overflow-y-scroll",
            }}
          >
            {accounts?.map((account) => (
              <DropdownItem
                key={account.address}
                value={account.address}
                description={trimAddress(
                  encodeAddress(account.address, ss58Format)
                )}
                startContent={
                  <Identicon
                    value={account.address}
                    size={30}
                    theme="polkadot"
                    className="hover:cursor-pointer"
                  />
                }
                endContent={
                  <Button
                    className="cursor-copy bg-transparent"
                    size="sm"
                    isIconOnly={true}
                    onClick={(e) => {
                      navigator.clipboard.writeText(
                        encodeAddress(account.address, ss58Format)
                      );
                    }}
                  >
                    <Copy width={20} height={20} stroke="currentColor" />
                  </Button>
                }
                aria-label={account.address}
              >
                {account.meta?.name || trimAddress(account.address)}
              </DropdownItem>
            ))}
          </DropdownSection>
          <DropdownSection title="Actions">
            <DropdownItem
              startContent={
                <Users width={20} height={20} stroke="currentColor" />
              }
              key={"profile"}
              value={"profile"}
              aria-label={"profile"}
            >
              <NextLink href={"/profile"}>Profile</NextLink>
            </DropdownItem>
            <DropdownItem
              startContent={
                <UseCases width={20} height={20} stroke="currentColor" />
              }
              key={"logout"}
              value={"logout"}
              aria-label={"logout"}
              onClick={disconnect}
            >
              Logout {selectedAccount?.meta?.name}
            </DropdownItem>
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};
