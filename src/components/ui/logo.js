import Link from "next/link";
import Image from "next/legacy/image";

export default function Logo(props) {
  return (
    <Link
      href="/"
      className="text-md sm:text-lg md:text-2xl upfont-black uppercase leading-none text-gray-900 select-none logo flex items-center font-black"
      { ...props }
    >
        <div className="logo-wrap h-12 w-12 relative">
          <Image
            className="h-12 w-12 relative"
            src="/proof-of-chaos-logo.png"
            alt="Proof of Chaos Logo"
            layout='fill'
            objectFit='contain'
          />
        </div>
        <span className="pl-1 sm:pl-2 md:pl-4">Proof of Chaos</span>
    </Link>
  )
}