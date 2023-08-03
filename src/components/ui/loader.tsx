import Image from "next/legacy/image";
import styles from "../../../styles/Loader.module.scss";

export default function Loader({
  text = "loading",
  width = 80,
  height = 80,
  className,
}: {
  text?: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  return (
    <div className={styles.loader}>
      <Image
        src="/proof-of-chaos-logo.png"
        alt="Proof of Chaos Logo"
        width={width}
        height={height}
      />
      <span className={styles.text}>
        {text.split("").map((char, idx) => (
          <span className={styles.char} key={`loader-${char}${idx}`}>
            {char}
          </span>
        ))}
      </span>
    </div>
  );
}

export function InlineLoader() {
  return (
    <div className={styles.inlineLoader}>
      <span>.</span>
      <span>.</span>
      <span>.</span>
    </div>
  );
}