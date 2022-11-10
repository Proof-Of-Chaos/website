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
      className="pb-2"
    />
    <span className={ styles.text }>
      { text.split("").map( 
        char => <span className={ styles.char } key={ char }>{ char }</span>
      )}
    </span>
  </div>
}

export function InlineLoader() {
  return (
    <div className="loader inline-flex">
      <span>.</span>
      <span>.</span>
      <span>.</span>
    </div>
  )
}