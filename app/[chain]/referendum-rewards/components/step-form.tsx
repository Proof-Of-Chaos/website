import { Card, CardBody } from "@nextui-org/card";
import { Tabs, Tab } from "@nextui-org/tabs";
import { executeStream, streamToJSON } from "@/components/util-client";
import { Button } from "@nextui-org/button";
import { vividButtonClasses } from "@/components/primitives";
import { Progress } from "@nextui-org/progress";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import async from "../page";
import { StreamResult } from "@/types";

export function StepForm() {
  const [step, setStep] = useState(0);
  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);
  // create array with index of all children
  const otherSteps = [0, 1, 2].filter((index) => index > step).map(String);

  const resultNode = useRef<HTMLDivElement>(null);

  console.log(otherSteps);

  const [streamData, setStreamData] = useState<StreamResult>();
  const dataCounter = useRef(0);

  function onFinished(data: StreamResult) {
    setTimeout(() => {
      setStreamData({ value: "✅ Done", done: true });
    }, 1500);

    setTimeout(() => {
      nextStep();
      dataCounter.current = 1;
    }, 3000);
  }

  async function actionGenerateRewardTxs() {
    console.log("fetching DATA stream");
    const response = await fetch("/api/test", {
      method: "post",
    });

    executeStream(response, setStreamData, onFinished);
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
                <span className="text-4xl">1</span>
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
                onClick={actionGenerateRewardTxs}
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
                <span className="text-4xl">2</span>
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
                <span className="text-4xl">3</span>
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
