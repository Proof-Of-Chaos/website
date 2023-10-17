import { InlineLoader } from "@/components/inline-loader";
import { title } from "@/components/primitives";

export default function Loading() {
  return (
    <>
      {" "}
      <h1 className={title({ siteTitle: true })}>
        Rewards
        <span className="text-lg pl-4 bg-clip-text text-transparent bg-gradient-to-tr from-purple-600 to-blue-300">
          beta
        </span>
      </h1>
      <div className="text-center w-full">
        Loading <InlineLoader />
      </div>
    </>
  );
}
