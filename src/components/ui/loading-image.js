import Image from "next/legacy/image";
import { useState } from "react";
import { shimmer, toBase64 } from "../../utils/utils";

export default function LoadingImage(props) {
  const [src, setSrc] = useState(props.src);

  const { width, height, alt, fallbackImage = "test" } = props;

  return (
    <Image
      {...props}
      alt={alt}
      src={src}
      placeholder="blur"
      blurDataURL={`data:image/svg+xml;base64,${toBase64(
        shimmer(width, height)
      )}`}
      onError={() => setSrc(fallbackImage)}
    />
  );
}
