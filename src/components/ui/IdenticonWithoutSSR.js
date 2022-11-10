import dynamic from "next/dynamic";

const IdenticonWithoutSSR = dynamic(
  () => import("@polkadot/react-identicon"),
  {
    ssr: false,
  }
)

export default IdenticonWithoutSSR
