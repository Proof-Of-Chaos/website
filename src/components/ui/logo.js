import Link from "next/link";
import Image from "next/image";
import logo from '../../../public/logo.webp'

export default function Logo(props) {
  return (
    <Link
      href="/"
      { ...props }
    >
    <a href="#_" className="text-xl font-black leading-none text-gray-900 select-none logo">GovRewards<span className="text-indigo-600">.</span></a>
    </Link>
  )
}