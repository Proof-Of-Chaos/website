import { title, vividButtonClasses } from "@/components/primitives";
import { Tab, Tabs } from "@nextui-org/tabs";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@nextui-org/button";
import clsx from "clsx";
import { Progress } from "@nextui-org/progress";
import { Card, CardBody, CardFooter } from "@nextui-org/card";
import { StreamResult, SubstrateChain } from "@/types";
import { getChainInfo } from "@/config/chains";
import { useFormContext } from "react-hook-form";
import { rewardsConfig } from "@/config/rewards";
import { useAppStore } from "@/app/zustand";
import { TxTypes } from "@/components/util-client";
import { z } from "zod";
import {
  GenerateRewardsResult,
  RewardConfiguration,
  RewardCriteria,
  SendAndFinalizeResult,
} from "../types";
import { TxButton } from "@/components/TxButton";
import { bnToBn } from "@polkadot/util";
import ModalAnalyzeSendout from "./modal-analyze-sendout";
import { useDisclosure } from "@nextui-org/modal";
import { TextRotator } from "@/components/text-rotator";
import { mergeWithDefaultConfig } from "../../../../components/util";
import { error } from "console";
import { Link } from "@nextui-org/link";
import { rewardsSchema } from "../rewards-schema";
import { usePolkadotExtension } from "@/context/polkadot-extension-context";
import { config } from "process";
export const revalidate = 3600;

type ConfigReqBody = RewardConfiguration & {
  blockNumbers?: (number | undefined)[];
  txHashes: (string | undefined)[];
};

export default function FormActions({
  className,
  // onSubmit,
  chain,
}: {
  className?: string;
  // onSubmit?: (data: any) => Promise<any>;
  chain: SubstrateChain;
}) {
  const { selectedAccount } = usePolkadotExtension();
  const userAddress = selectedAccount?.address;

  const activeChain = getChainInfo(chain);
  const { ss58Format, name: activeChainName } = activeChain;
  const chainRewardsSchema = rewardsSchema(
    activeChainName,
    userAddress,
    ss58Format
  );
  type TypeRewardsSchema = z.infer<typeof chainRewardsSchema>;

  const { isOpen: isAnalyzeOpen, onOpenChange: onAnalyzeOpenChange } =
    useDisclosure();

  const explode = useAppStore((s) => s.explode);

  const [rewardSendoutData, setRewardSendoutData] =
    useState<GenerateRewardsResult>(undefined);

  const totalFees =
    rewardSendoutData?.fees?.nfts && rewardSendoutData?.fees?.deposit
      ? bnToBn(rewardSendoutData.fees.nfts).add(
        bnToBn(rewardSendoutData.fees.deposit)
      )
      : undefined;

  const [step, setStep] = useState(0);
  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);
  // create array with index of all children
  const otherSteps = [0, 1, 2].filter((index) => index > step).map(String);

  const [signingIndex, setSigningIndex] = useState<number>(0);
  const amountOfTxs = rewardSendoutData?.txsCount?.txsPerVote;
  const [txResult, setTxResult] = useState<SendAndFinalizeResult[]>();

  const formMethods = useFormContext();

  const {
    formState: { isSubmitting, errors },
    setError,
    handleSubmit,
    watch,
    reset,
  } = formMethods;

  const watchFormFields = watch();

  function onReset() {
    setStep(0);
    reset();
  }

  async function onSubmit(data: Partial<TypeRewardsSchema>) {
    // append all data needed for the rewards creation to a FormData object
    const formData = new FormData();

    // form fields
    formData.append("rewardConfig", JSON.stringify(data));

    // chain + walletAddress of the sender
    formData.append("chain", chain);
    if (userAddress) {
      formData.append("sender", userAddress);
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
      if (!option.coverCid && option.fileCover?.[0]) {
        formData.append(
          `${option.rarity}FileCover`,
          option.fileCover[0],
          option.fileCover[0].name
        );
      }
    });
    if (data.collectionConfig?.file?.[0]) {
      formData.append(
        "collectionImage",
        data.collectionConfig.file[0],
        data.collectionConfig.file[0].name
      );
    }

    const response = await fetch("/api/rewards", {
      method: "POST",
      body: formData,
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", response.headers.get("Content-Type"));
    const text = await response.text();  // Get the response text first
    console.log("Response text:", text);

    let responseData;

    try {
      responseData = await response.json(); // Try parsing it as JSON
      console.log("Parsed response data:", responseData);
    } catch (error) {
      console.error("Error parsing response as JSON:", error);
    }

    if (!response.ok) {
      console.error("error getting response from server", responseData);
      setError("root", {
        message: "Error reaching server",
      });
    }
    if (responseData.errors) {
      const errors = responseData.errors;
      if (errors.criteria) {
        setError("criteria", {
          type: "server",
          message: errors.criteria,
        });
      } else if (errors.refIndex) {
        setError("refIndex", {
          type: "server",
          message: errors.refIndex,
        });
      } else {
        setError("root", {
          message: errors.form,
        });
      }
    }

    if (response.ok && responseData.status === "success") {
      const maxTxsPerBatch =
        Math.floor(
          rewardsConfig.NFT_BATCH_SIZE_MAX / responseData?.txsCount?.txsPerVote
        ) * responseData?.txsCount?.txsPerVote;

      let kusamaAssetHubTxsBatches: TxTypes[] | undefined =
        responseData?.kusamaAssetHubTxs;

      if (kusamaAssetHubTxsBatches && Array.isArray(kusamaAssetHubTxsBatches)) {
        // group the kusamaAssetHubTxs in batches of max size maxTxsPerbatch making sure that txs belonging together (multiples of 13) are never split to different batches
        const batches = kusamaAssetHubTxsBatches.reduce((acc, tx, index) => {
          const batchIndex: number = Math.floor(index / maxTxsPerBatch);
          if (!acc[batchIndex]) {
            acc[batchIndex] = [];
          }
          acc[batchIndex].push(tx);
          return acc;
        }, [] as TxTypes[][]);

        setRewardSendoutData({
          ...responseData,
          kusamaAssetHubTxsBatches: batches,
        });
      } else {
        setRewardSendoutData({
          ...responseData,
        });
      }

      nextStep();
    }
  }

  async function actionCreateConfigNFT(configReqBody: ConfigReqBody) {
    const createConfigRes = await fetch("/api/create-config-nft", {
      method: "POST",
      body: JSON.stringify(configReqBody),
    });

    console.log("create config nft result", createConfigRes);
  }

  function onStart() {
    setSigningIndex(1);
  }

  function onPartFinished({
    status,
    txHash,
    blockHeader,
  }: SendAndFinalizeResult): void {
    console.log("part finished, status", status, txHash, blockHeader);
    if (status === "success") {
      setSigningIndex((prev) => prev + 1);
    } else {
      console.error("error sending tx", txHash);
      setError("root", {
        message: `Error sending tx ${signingIndex}/${amountOfTxs}. Please try again.`,
      });
    }
  }

  function onFinished(
    results: SendAndFinalizeResult[] | SendAndFinalizeResult
  ): void {
    console.log("onfinished", results);

    if (!Array.isArray(results)) {
      results = [results];
    }

    setTxResult(results);

    if (results.every((res) => res.status === "success")) {
      explode(true);
      nextStep();

      const sendoutConfig = rewardSendoutData?.config ?? watchFormFields;

      const configReqBody = {
        ...mergeWithDefaultConfig(sendoutConfig, activeChainName),
        chain: activeChainName,
        criteria: watchFormFields.criteria as RewardCriteria,
        blockNumbers: results.map((res) => res.blockHeader?.number.toNumber()),
        txHashes: results.map((res) => res.txHash),
      };

      actionCreateConfigNFT(configReqBody);
    } else {
      console.error("error sending txs", results);
      setError("root", {
        message: "Error sending txs",
      });
    }
  }

  return (
    <div
      className={clsx(
        "flex w-full flex-col border-2 p-4 border-secondary-400 rounded-lg shadow-lg shadow-secondary-400",
        className
      )}
    >
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
        variant="underlined"
        color="secondary"
        size="lg"
      >
        <Tab title="1 Setup NFTs ✨" key="0">
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
                className={clsx("w-full h-20 mt-4 ", vividButtonClasses)}
                variant="shadow"
                onClick={handleSubmit(onSubmit)}
                isLoading={isSubmitting}
                isDisabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    {activeChain && (
                      <activeChain.icon className="animate-spin" />
                    )}{" "}
                    <TextRotator />
                  </>
                ) : (
                  <>
                    Generate {activeChain && <activeChain.icon />} reward
                    transactions
                  </>
                )}
              </Button>
            </CardBody>
          </Card>
        </Tab>
        <Tab title="2 Mint NFTs 🔏" key="1">
          <Card className="text-sm">
            <CardBody>
              <div className="flex gap-4 items-center mb-4">
                <p>
                  Start the sendout process. You will be asked to sign
                  <span className="text-warning px-4">
                    {amountOfTxs ?? "multiple"} transactions in sequence.
                  </span>
                  Complete all for a full sendout.
                </p>
              </div>
              {rewardSendoutData && (
                <Button
                  onClick={onAnalyzeOpenChange}
                  color="secondary"
                  variant="bordered"
                  className="self-end flex-grow w-full mb-4"
                >
                  Analyze Sendout
                </Button>
              )}
              <TxButton
                extrinsic={rewardSendoutData?.kusamaAssetHubTxsBatches}
                requiredBalance={totalFees}
                variant="shadow"
                isDisabled={isSubmitting || step !== 1}
                className={clsx("w-full h-20 border-2", vividButtonClasses)}
                onPartFinished={onPartFinished}
                onFinished={onFinished}
                onStart={onStart}
              >
                {signingIndex === 0 ? (
                  <>
                    Start the {activeChain && <activeChain.icon />} rewards
                    sendout
                  </>
                ) : (
                  <>
                    Sending Transaction {signingIndex}/{amountOfTxs}
                  </>
                )}
              </TxButton>
            </CardBody>
          </Card>
        </Tab>
        <Tab title="3 View NFTs 🥳" key="2">
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
                {activeChain.kodadot && (
                  <Link
                    href={`${activeChain.kodadot}/collection/${watchFormFields.collectionConfig?.id}`}
                    isExternal
                  >
                    <Button color="secondary">
                      View Collection on Kodadot
                    </Button>
                  </Link>
                )}
                {txResult &&
                  txResult.map(({ txHash }, idx) => (
                    <Link
                      href={`${activeChain.subscanAssetHub}/extrinsic/${txHash}`}
                      isExternal
                      key={idx}
                    >
                      <Button color="secondary">
                        View Transaction {idx + 1}
                      </Button>
                    </Link>
                  ))}
                <Button className="w-full" onClick={onReset}>
                  ♻️ Start Again
                </Button>
              </div>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
      {errors && Object.keys(errors).length > 0 && (
        <span className="text-danger text-lg text-center w-full">
          There are input errors, please see above.
        </span>
      )}
      <ModalAnalyzeSendout
        sendoutData={rewardSendoutData}
        onOpenChange={onAnalyzeOpenChange}
        isOpen={isAnalyzeOpen}
      />
      {/* <pre className="text-tiny">
        {JSON.stringify(watchFormFields, null, 2)}
      </pre> */}
    </div>
  );
}
