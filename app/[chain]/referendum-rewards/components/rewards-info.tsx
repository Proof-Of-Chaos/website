"use client";

import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Link, LinkIcon } from "@nextui-org/link";
import { titleCase } from "../../../../components/util";
import { usePolkadotApis } from "@/context/polkadot-api-context";

export function RewardsInfo() {
  const { activeChainName } = usePolkadotApis();
  return (
    <Card className="border border-2 border-secondary text-tiny mb-8 items-center align-center text-center">
      <CardBody className="flex-none inline text-center">
        NFTs will be minted on{" "}
        <span className="text-warning">
          {titleCase(activeChainName)}&nbsp;Asset Hub
        </span>
        , so fees are also payed on Asset Hub, make sure you understand and have
        enough funds.
      </CardBody>
    </Card>
  );
}
