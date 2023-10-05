"use client";

import clsx from "clsx";
import Link from "next/link";
import { link as linkStyles } from "@nextui-org/theme";
import { usePathname } from "next/navigation";
import { SubstrateChain } from "@/types";
import { LinkProps } from "@nextui-org/link";
import { DEFAULT_CHAIN } from "@/config/chains";
import { usePolkadotApis } from "@/context/polkadot-api-context";

export function ChainLink(props: any) {
  const { href, children, ...rest } = props;

  const { activeChainName } = usePolkadotApis();
  const name = activeChainName ?? DEFAULT_CHAIN;
  const chainLinkHref = `/${name}${href}`;

  return (
    <Link href={chainLinkHref ?? ""} {...rest}>
      {children}
    </Link>
  );
}
