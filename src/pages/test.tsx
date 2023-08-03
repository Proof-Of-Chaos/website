import React from "react";
import { useEffect, useState } from "react";
import { streamToJSON } from "../utils";
import LoadingComponent from "../components/ui/loadingComponent";

export function Test(): React.ReactElement {
  const [state, setState] = useState({ step: 0 });

  return (
    <main>
      <LoadingComponent
        className="w-52"
        isLoading={true}
        loaderText="Creating new NFT collection"
      >
        <div>hello</div>
      </LoadingComponent>
    </main>
  );
}

export default Test;
