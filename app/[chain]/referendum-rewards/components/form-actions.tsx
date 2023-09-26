import { title, vividButtonClasses } from "@/components/primitives";
import { Tab } from "@nextui-org/tabs";
import React from "react";
import { Button } from "@nextui-org/button";
import clsx from "clsx";
import { Progress } from "@nextui-org/progress";
import { Card, CardBody, CardFooter } from "@nextui-org/card";
import { StepForm } from "./step-form";
import { InlineLoader } from "../../../../components/inline-loader";
export const revalidate = 3600;

export default function FormActions({ className }: { className?: string }) {
  return (
    <div className={className}>
      <StepForm />
    </div>
  );
}
