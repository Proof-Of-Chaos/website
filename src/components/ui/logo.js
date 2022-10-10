import Link from "next/link";
import Image from "next/image";

export default function Logo(props) {
  return (
    <Link
      href="/"
      { ...props }
    >
    <>
      <a className="text-lg sm:text-xl md:text-2xl upfont-black uppercase leading-none text-gray-900 select-none logo flex items-center font-black">
        <div className="logo-wrap h-12 w-12 relative">
          <Image
            className="h-12 w-12 relative"
            src="/proof-of-chaos-logo.png"
            alt="Proof of Chaos Logo"
            layout='fill'
            objectFit='contain'
          />
        </div>
        <span className="pl-4">Proof of Chaos</span>
      </a>
    </>
    </Link>
  )
}