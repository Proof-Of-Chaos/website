import { title } from "@/components/primitives";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vote",
  description: "Vote on OpenGov Referenda on Polkadot and Kusama",
};

export default function VotePage() {
  return (
    <div>
      <h1 className={title({ siteTitle: true })}>Vote</h1>
    </div>
  );
}
