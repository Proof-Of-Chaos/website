import { useWindowScroll } from "react-use"
import { MenuItems } from './layout-menu'
import { useBreakpoint } from '../hooks/use-breakpoint'
import { isMounted, useIsMounted } from '../hooks/use-is-mounted'
import Hamburger from "../components/ui/hamburger"
import WalletConnect from "../components/nft/wallet-connect"
import Logo from "../components/ui/logo";
import Footer from "../components/ui/footer"
import { useState } from "react"
import { useDrawer } from "../components/drawer/context"
import { NextSeo } from "next-seo"

function HeaderRight() {
  const { openDrawer, isOpen } = useDrawer();

  return(
    <div className="order-last flex shrink-0 items-center">
      <WalletConnect className="hidden sm:block pl-3 pr-3 ml-3" />
      <div className="lg:hidden">
        <Hamburger
          isOpen={isOpen}
          onClick={() => openDrawer('DASHBOARD_SIDEBAR')}
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
      className={`fixed top-0 z-30 flex w-full items-center justify-between px-4 transition-all duration-300 ltr:right-0 rtl:left-0 sm:px-10 lg:px-10 xl:px-10 3xl:px-12 ${
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
      <main className="mb-12 flex flex-grow flex-col pt-16 sm:pt-24 overflow-x-hidden">
        {children}
      </main>
      <Footer />
    </div>
  )
}