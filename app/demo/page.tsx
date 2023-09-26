"use client";

import { title, vividButtonClasses } from "@/components/primitives";
import { StepForm } from "../[chain]/referendum-rewards/components/step-form";
import { Tab } from "@nextui-org/tabs";
import React from "react";
import { Button } from "@nextui-org/button";
import clsx from "clsx";
import { Progress } from "@nextui-org/progress";
import { Card, CardBody, CardFooter } from "@nextui-org/card";
import { streamToJSON } from "@/components/util-client";
export const revalidate = 3600;

export default function DemoPage() {
  return (
    <div>
      <h1 className={title({ siteTitle: true })}>Demo</h1>
      <StepForm></StepForm>
    </div>
  );
}
