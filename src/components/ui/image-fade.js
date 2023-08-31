import { useState } from "react";
import NextImage from "next/legacy/image";

export default function Image( props ) {
  const [ready, setReady] = useState(false);

  const handleLoad = (event) => {
    event.persist();
    if (event.target.srcset) {
      setReady(true);
    }
  };

  return (
    <div
      style={{
        opacity: ready ? 1 : 0,
        transition: "opacity .5s ease-in-out"
      }}
    >
      <NextImage
        onLoad={handleLoad}
        { ...props }
      />
    </div>
  );
}
