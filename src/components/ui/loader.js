import Image from "next/image"
import styles from '../../../styles/Loader.module.scss'

export default function Loader({
  text="loading",
  width=64,
  height=128,
}) {

  return <div className={ styles.loader } >
    <Image
      src="/proof-of-chaos-logo.png"
      alt="Proof of Chaos Logo"
      objectFit='contain'
      width={ width }
      height={ height }
    />
    <span className={ styles.text }>
      { text.split("").map(
        (char, idx) => 
          <span
            className={ styles.char }
            key={ `loader-${char}${idx}` }
          >
            { char }
          </span>
      )}
    </span>
  </div>
}

export function InlineLoader() {
  return (
    <div className={ styles.inlineLoader }>
      <span>.</span>
      <span>.</span>
      <span>.</span>
    </div>
  )
}