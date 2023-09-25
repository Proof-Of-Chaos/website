import React from "react";
import { Card, CardBody } from "@nextui-org/card";
import { Tabs, Tab } from "@nextui-org/tabs";

export function StepForm({
  children,
  activeStep,
}: {
  children: React.ReactNode;
  activeStep: number;
}) {
  // create array with index of all children
  const otherSteps = React.Children.toArray(children)
    .map((_, idx) => idx.toString())
    .filter((index) => index !== activeStep.toString());

  console.log("otherSteps", otherSteps);

  return (
    <div className="flex w-full flex-col border-2 p-4 border-secondary rounded-md shadow-lg shadow-secondary">
      <Tabs
        disabledKeys={otherSteps}
        selectedKey={activeStep.toString()}
        aria-label="Disabled Options"
        classNames={{
          tabList: "w-full",
        }}
        variant="underlined"
        color="secondary"
        size="lg"
      >
        {children}
      </Tabs>
    </div>
  );
}
