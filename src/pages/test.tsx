import React from "react";
import { useEffect, useState } from "react";
import { streamToJSON } from "../utils";

export function Test(): React.ReactElement {
  const [state, setState] = useState({ step: 0 });

  useEffect(() => {
    const callApi = async () => {
      const data = await fetch("/api/hello", { method: "post" });

      const stream = data.body;

      if (!stream) {
        return;
      }

      for await (const message of streamToJSON(stream)) {
        console.log("message", message);
        setState(JSON.parse(message));
      }
    };

    callApi();
  }, []);

  return (
    <main>
      <div>Current step is: {state.step}</div>
    </main>
  );
}

export default Test;
