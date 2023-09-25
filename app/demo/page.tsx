"use client";

import { title, vividButtonClasses } from "@/components/primitives";
import { StepForm } from "../[chain]/referendum-rewards/components/step-form";
import { Tab } from "@nextui-org/tabs";
import React from "react";
import { Button } from "@nextui-org/button";
import clsx from "clsx";
import { Progress } from "@nextui-org/progress";
import { Card, CardBody, CardFooter } from "@nextui-org/card";
export const revalidate = 3600;

export default function DemoPage() {
  const [step, setStep] = React.useState(0);
  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  return (
    <div>
      <h1 className={title({ siteTitle: true })}>Demo</h1>
      <StepForm activeStep={step}>
        <Tab title="1: Create Txs" key="0">
          <Card className="text-sm">
            <CardBody>
              <div className="flex gap-4 items-center mb-4">
                <span className="text-4xl">1</span>
                <div>
                  <p>
                    Create on chain transactions based on your configuration
                    above, i.e. pin files to ipfs, calculate distribution of
                    nfts, mint nft transactions, set nft attributes, etc. This
                    process can take up to 1 minute.
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
                onClick={nextStep}
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
              <div className="text-tiny text-center flex justify-center w-full z-10">
                <span className="bg-content1/80 px-6 mt-1">
                  🚀 Generating calls for reward distribution of referendum 123
                </span>
              </div>
            </CardBody>
          </Card>
        </Tab>
        <Tab title="2: Sign Txs" key="1">
          <Card className="text-sm">
            <CardBody>
              <div className="flex gap-4 items-center mb-4">
                <span className="text-4xl">2</span>
                Start the sendout process. You will be asked to sign{" "}
                <span className="text-warning text-2xl">7</span>
                transactions in sequence. Complete all for a full sendout.
              </div>
            </CardBody>
          </Card>
        </Tab>
        <Tab title="3: View" key="2">
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
                  <Button color="secondary">View Transaction {id}</Button>
                ))}
                <Button className="w-full">♻️ Start Again</Button>
              </div>
            </CardBody>
          </Card>
        </Tab>
      </StepForm>
      <Button onClick={prevStep}>Prev</Button>
      <Button onClick={nextStep}>Next</Button>
      <Button onClick={() => setStep(0)}>Reset</Button>
    </div>
  );
}
