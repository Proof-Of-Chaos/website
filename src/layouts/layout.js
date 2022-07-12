import { useWindowScroll } from "react-use"
import { MenuItems } from './layout-menu'
import { useBreakpoint } from '../lib/hooks/use-breakpoint'
import { isMounted, useIsMounted } from '../lib/hooks/use-is-mounted'
import Hamburger from 'hamburger-react'
import WalletConnect from "../components/nft/wallet-connect"
import Logo from "../components/ui/logo";
import Footer from "../components/ui/footer"

function HeaderRight() {
  return(
    <div className="order-last flex shrink-0 items-center">
      <WalletConnect />
      <div className="lg:hidden">
        <Hamburger
          className="shadow-main dark:border dark:border-solid dark:border-gray-700 dark:bg-light-dark dark:text-white"
        />
      </div>
    </div>
  )
}

export function Header() {
  const { y: windowY } = useWindowScroll();
  const breakpoint = useBreakpoint();
  const isMounted = useIsMounted();

  return (
    <nav
      className={`fixed top-0 z-30 flex w-full items-center justify-between px-4 transition-all duration-300 ltr:right-0 rtl:left-0 sm:px-6 lg:px-8 xl:px-10 3xl:px-12 ${
        windowY > 10
          ? 'h-16 bg-gradient-to-b from-gray-50 to-gray-50/80 shadow-card backdrop-blur-sm dark:from-dark dark:to-dark/80 sm:h-20'
          : 'h-16 bg-body dark:bg-dark sm:h-24'
      }`}
    >
      <Logo />
      {isMounted && ['xs', 'sm', 'md'].indexOf(breakpoint) == -1 && (
        <MenuItems />
      )}
      <HeaderRight />
    </nav>
  )
}

export default function Layout({ children }) {
  return(
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mb-12 flex flex-grow flex-col pt-32 sm:pt-32">
        {children}
      </main>
      <Footer />
    </div>
  )
}