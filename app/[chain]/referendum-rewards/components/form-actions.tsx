import { title, vividButtonClasses } from "@/components/primitives";
import { Tab, Tabs } from "@nextui-org/tabs";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@nextui-org/button";
import clsx from "clsx";
import { Progress } from "@nextui-org/progress";
import { Card, CardBody, CardFooter } from "@nextui-org/card";
import { StreamResult, SubstrateChain } from "@/types";
import { useForm, useFormContext } from "react-hook-form";
import { getChainInfo } from "@/config/chains";
import { useAppStore } from "@/app/zustand";
import { rewardsSchema } from "../util";
import { rewardsConfig } from "@/config/rewards";
import { z } from "zod";
import { executeStream } from "@/components/util-client";
export const revalidate = 3600;

export default function FormActions({
  className,
  chain,
}: {
  className?: string;
  chain: SubstrateChain;
}) {
  const { ss58Format, name: activeChainName } = getChainInfo(chain);
  const chainRewardsSchema = rewardsSchema(activeChainName, ss58Format);
  type TypeRewardsSchema = z.infer<typeof chainRewardsSchema>;
  const { DEFAULT_REWARDS_CONFIG } = rewardsConfig;

  const explode = useAppStore((s) => s.explode);

  const walletAddress = useAppStore(
    (state) => state.user.actingAccount?.address
  );

  const [step, setStep] = useState(0);
  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);
  // create array with index of all children
  const otherSteps = [0, 1, 2].filter((index) => index > step).map(String);

  const resultNode = useRef<HTMLDivElement>(null);

  console.log(otherSteps);

  const [streamData, setStreamData] = useState<StreamResult>();
  const dataCounter = useRef(0);

  const formMethods = useFormContext();
  const { handleSubmit, setValue, setError } = formMethods;

  function onFinished(data: StreamResult) {
    setTimeout(() => {
      setStreamData({ value: "✅ Done", done: true });
    }, 1500);

    // setTimeout(() => {
    //   nextStep();
    //   dataCounter.current = 1;
    // }, 3000);
  }

  useEffect(() => {
    if (streamData) {
      dataCounter.current += 1;
      let p = document.createElement("p");
      p.append(`${streamData?.value}`);
      resultNode.current?.append(p);

      if (resultNode.current) {
        resultNode.current.scrollTop = resultNode.current.scrollHeight;
      }
    }
  });

  //TODO type
  async function onSubmit(data: TypeRewardsSchema) {
    // append all data needed for the rewards creation to a FormData object
    const formData = new FormData();

    // form fields
    formData.append("rewardConfig", JSON.stringify(data));

    // chain + walletAddress of the sender
    formData.append("chain", chain);
    if (walletAddress) {
      formData.append("sender", walletAddress);
    }

    // uploaded files
    data.options?.forEach((option) => {
      if (!option.imageCid && option.file?.[0]) {
        formData.append(
          `${option.rarity}File`,
          option.file[0],
          option.file[0].name
        );
      }
    });
    if (data.collectionConfig.file?.[0]) {
      formData.append(
        "collectionImage",
        data.collectionConfig.file[0],
        data.collectionConfig.file[0].name
      );
    }

    console.log("fetching DATA stream");
    const response = await fetch("/api/test", {
      method: "post",
      body: formData,
    });

    executeStream(response, setStreamData, onFinished);
  }

  return (
    <div className="flex w-full flex-col border-2 p-4 border-secondary-400 rounded-lg shadow-lg shadow-secondary-400">
      <Tabs
        disabledKeys={otherSteps}
        onSelectionChange={(key) => {
          setStep(parseInt(key as string));
        }}
        selectedKey={step.toString()}
        aria-label="Disabled Options"
        classNames={{
          tabList: "w-full",
        }}
        variant="light"
        color="secondary"
        size="lg"
      >
        <Tab title="1 Create Txs ✨" key="0">
          <Card className="text-sm">
            <CardBody>
              <div className="flex gap-4 items-center mb-4">
                <div>
                  <p>
                    Create on chain transactions based on your configuration
                    above, i.e. query the chain, pin files to ipfs, calculate
                    distribution of nfts, mint nft transactions, set nft
                    attributes, etc. This process can take up to 1 minute.
                  </p>
                  <p className="pt-4">
                    {" "}
                    In the next step you will be asked to sign the generated
                    calls.
                  </p>
                </div>
              </div>
              <Button
                type="submit"
                className={clsx(
                  "w-full h-20 mt-4 flex flex-col p-0 space-between",
                  vividButtonClasses
                )}
                variant="shadow"
                onClick={handleSubmit(onSubmit)}
              >
                Generate Kusama reward transactions
                <Progress
                  size="sm"
                  color="secondary"
                  isIndeterminate
                  aria-label="Loading..."
                  className="w-full  absolute bottom-0 left-0"
                />
              </Button>
              <div className="relative text-tiny text-center flex justify-center w-full z-10 flex-col">
                <div className="absolute top-4 right-2 text-white">status</div>
                <div
                  className="h-20 mt-3 scroll-smooth overflow-scroll text-left w-full rounded-md bg-black/80 text-white p-2"
                  ref={resultNode}
                ></div>
              </div>
            </CardBody>
          </Card>
        </Tab>
        <Tab title="2 Sign Txs 🔏" key="1">
          <Card className="text-sm">
            <CardBody>
              <div className="flex gap-4 items-center mb-4">
                <p>
                  Start the sendout process. You will be asked to sign
                  <span className="text-warning px-4">
                    7 transactions in sequence.
                  </span>
                  Complete all for a full sendout.
                </p>
              </div>
            </CardBody>
          </Card>
        </Tab>
        <Tab title="3 View 🥳" key="2">
          <Card className="text-sm">
            <CardBody>
              <div className="flex gap-4 flex-wrap items-center mb-4">
                🎉 Congratulations, you successfully minted{" "}
                <span className="text-warning">732</span> NFTs in total: <br />
                <span className="text-warning">523</span>common,
                <span className="text-warning">109</span>rare,
                <span className="text-warning">59</span>epic.
              </div>
              <div className="flex gap-4 flex-wrap">
                <Button color="secondary">View Collection on Kodadot</Button>
                {[0, 1, 2].map((id) => (
                  <Button color="secondary" key={id}>
                    View Transaction {id}
                  </Button>
                ))}
                <Button className="w-full">♻️ Start Again</Button>
              </div>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
}
