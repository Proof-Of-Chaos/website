import { Fragment } from 'react';
import Link from 'next/link';
// import Logo from '@/components/ui/logo';
// import Button from '@/components/ui/button';
import { Menu } from '@headlessui/react';
import { Transition } from '@headlessui/react';
import cn from 'classnames';
import { useRouter } from 'next/router';
import WalletConnect from '../components/nft/wallet-connect';
import Logo from '../components/ui/logo';
import Button from '../components/ui/button';
import { useDrawer } from '../components/drawer/context';
// import Link from '@/components/ui/links/active-link';

// import Scrollbar from '@/components/ui/scrollbar';
// import { ChevronForward } from '@/components/icons/chevron-forward';
// import { Close } from '@/components/icons/close';
// import { useDrawer } from '@/components/drawer-views/context';
// import { ChevronDown } from '@/components/icons/chevron-down';

const MenuLinks = [
  {
    name: 'About',
    href: '/about' },
  {
    name: 'NFTs',
    href: '/nfts' },
  {
    name: 'Vote',
    href: '/vote',
  },
  // {
  //   name: 'Statistics',
  //   href: '/statistics',
  // },
  {
    name: 'Leaderboard',
    href: '/leaderboard',
  },
];

export function MenuItems() {
  let { pathname } = useRouter();

  return (
    <div className="flex flex-1 justify-end px-8 xl:px-10 2xl:px-14 3xl:px-16">
      {MenuLinks.map((item, index) => {
        return (
          <Link
            key={item.name}
            href={item.href}
          >
            <a
              className={
                cn(
                  "mx-4 text-xl text-center transition first:ml-0 last:mr-0 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-black",
                  item.href === pathname ? 'text-brand-600' : 'text-black'
                )
              }
            >
              {item.name}
            </a>
          </Link>
        )
      })}
    </div>
  );
}

export default function DrawerMenu() {
  let { pathname } = useRouter();
  const { closeDrawer } = useDrawer();
  return (
    <div className="relative w-full max-w-full bg-white dark:bg-dark w-80">
      <div className="flex h-24 items-center justify-between overflow-hidden px-6 py-4">
        <div className="md:hidden">
          <Button onClick={ closeDrawer } className="hover:shadow-none px-0 mx-0 pl-1">
            <svg className="w-6 h-6" version="1.1" xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 460.775 460.775" xmlSpace="preserve">
              <path d="M285.08,230.397L456.218,59.27c6.076-6.077,6.076-15.911,0-21.986L423.511,4.565c-2.913-2.911-6.866-4.55-10.992-4.55
                c-4.127,0-8.08,1.639-10.993,4.55l-171.138,171.14L59.25,4.565c-2.913-2.911-6.866-4.55-10.993-4.55
                c-4.126,0-8.08,1.639-10.992,4.55L4.558,37.284c-6.077,6.075-6.077,15.909,0,21.986l171.138,171.128L4.575,401.505
                c-6.074,6.077-6.074,15.911,0,21.986l32.709,32.719c2.911,2.911,6.865,4.55,10.992,4.55c4.127,0,8.08-1.639,10.994-4.55
                l171.117-171.12l171.118,171.12c2.913,2.911,6.866,4.55,10.993,4.55c4.128,0,8.081-1.639,10.992-4.55l32.709-32.719
                c6.074-6.075,6.074-15.909,0-21.986L285.08,230.397z"/>
            </svg>
          </Button>
        </div>
      </div>

      {/* <Scrollbar style={{ height: 'calc(100% - 96px)' }}> */}
        <div className="flex flex-col px-6 pb-26 sm:pb-20">
            <>
              <Logo />
              <div className="pt-4 flex flex-col">
                {MenuLinks.map((item, index) => {
                  return (
                    <>
                      <Link
                        key={index}
                        href={item.href}
                      >
                        <a
                          className={
                            cn(
                              "py-3 text-xl font-bold transition first:ml-0 last:mr-0 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white",
                              item.href === pathname ? 'text-brand-600' : 'text-black'
                            )
                          }
                        >
                          {item.name}
                        </a>
                      </Link>
                    </>
                  )
                })}
              </div>
          </>
        </div>
      {/* </Scrollbar> */}

      <div className="absolute left-0 bottom-4 z-10 w-full px-6">
        <WalletConnect className="w-full" />
      </div>
    </div>
  );
}
