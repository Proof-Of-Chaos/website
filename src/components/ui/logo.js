import Link from "next/link";
import Image from "next/image";
import logo from '../../../public/logo.webp'

export default function Logo(props) {
  return (
    <Link
      href="/"
      { ...props }
    >
      <a className="flex items-center w-42 outline-none h-auto sm:w-42 4xl:w-36">
        <div className="w-12 h-12">
          <Image className="max-w-full h-auto rounded-full my-3" src={ logo } alt="GovRewards Logo" />
        </div>
        <span className="relative flex pl-3 overflow-hidden text-xl">
          GovRewards
        </span>
      </a>
    </Link>
  )
}