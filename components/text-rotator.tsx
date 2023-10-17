"use client";

import { useEffect, useState } from "react";

export function TextRotator({
  texts = ["Loading...", "Querying...", "Analyzing...", "Generating..."],
  timeout = 4000,
  className,
}: {
  texts?: string[];
  className?: string;
  timeout?: number;
}) {
  const [selectedTextIndex, setSelectedTextIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setSelectedTextIndex((prev) => (prev + 1) % texts.length);
    }, timeout);

    return () => clearInterval(intervalId);
  });

  return <span className={className}>{texts[selectedTextIndex]} </span>;
}
