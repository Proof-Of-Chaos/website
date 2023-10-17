import { InlineLoader } from "@/components/inline-loader";
import { title } from "@/components/primitives";

export default function Loading() {
  return (
    <>
      {" "}
      <h1 className={title({ siteTitle: true })}>Demo</h1>
      <div className="text-center w-full">
        Loading <InlineLoader />
      </div>
    </>
  );
}
