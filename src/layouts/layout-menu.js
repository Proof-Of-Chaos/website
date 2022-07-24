import { Fragment } from 'react';
import Link from 'next/link';
// import Logo from '@/components/ui/logo';
// import Button from '@/components/ui/button';
import { Menu } from '@headlessui/react';
import { Transition } from '@headlessui/react';
import cn from 'classnames';
import { useRouter } from 'next/router';
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
  {
    name: 'Statistics',
    href: '/statistics',
  },
];

export function MenuItems() {

  let { pathname } = useRouter();
  

  return (
    <div className="flex items-center xl:px-10 2xl:px-14 3xl:px-16">
      {MenuLinks.map((item, index) => {
        console.log( pathname === item.href);
        return (
          <>
            <Link
              key={index}
              href={item.href}
            >
              <a
                className={
                  cn(
                    "mx-4 text-lg font-medium transition first:ml-0 last:mr-0 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white",
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
  );
}

export default function DrawerMenu() {
  // const { closeDrawer } = useDrawer();
  return (
    <div className="relative w-full max-w-full bg-white dark:bg-dark xs:w-80">
      <div className="flex h-24 items-center justify-between overflow-hidden px-6 py-4">
        <div className="md:hidden">
          close drawer button
        </div>
      </div>

      {/* <Scrollbar style={{ height: 'calc(100% - 96px)' }}> */}
        <div className="flex flex-col px-6 pb-16 sm:pb-20">
          <Menu>
            {({ open }) => (
              <>
                <Menu.Button className="flex items-center justify-between border-t border-dashed py-3.5 text-justify text-sm font-medium uppercase text-gray-900 transition first:border-t-0 hover:text-gray-900 dark:text-white dark:hover:text-white">
                  Explore
                  {/* <ChevronForward
                    className={`ml-3 transition-transform ${
                      open ? 'rotate-90' : ''
                    }`}
                  /> */}
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="ease-in-out duration-200"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Menu.Items className="">
                    <Menu.Item>
                      <Link
                        href="/"
                        className="mb-3.5 flex items-center text-sm font-normal uppercase text-gray-600 before:mr-3.5 before:block before:h-1 before:w-1 before:shrink-0 before:rounded-full before:bg-gray-600 dark:text-gray-400 dark:before:bg-gray-400 dark:hover:text-white"
                        activeClassName="!text-gray-900 dark:!text-white dark:before:!bg-white before:!bg-gray-900 before:scale-125"
                      >
                        Collection
                      </Link>
                    </Menu.Item>
                    <Menu.Item>
                      <Link
                        href="/profile"
                        className="mb-3.5 flex items-center text-sm font-normal uppercase text-gray-600 before:mr-3.5 before:block before:h-1 before:w-1 before:shrink-0 before:rounded-full before:bg-gray-600 dark:text-gray-400 dark:before:bg-gray-400 dark:hover:text-white"
                        activeClassName="!text-gray-900 dark:!text-white dark:before:!bg-white before:!bg-gray-900 before:scale-125"
                      >
                        Trending
                      </Link>
                    </Menu.Item>
                    <Menu.Item>
                      <Link
                        href="/"
                        className="mb-3.5 flex items-center text-sm font-normal uppercase text-gray-600 before:mr-3.5 before:block before:h-1 before:w-1 before:shrink-0 before:rounded-full before:bg-gray-600 dark:text-gray-400 dark:before:bg-gray-400 dark:hover:text-white"
                        activeClassName="!text-gray-900 dark:!text-white dark:before:!bg-white before:!bg-gray-900 before:scale-125"
                      >
                        Browse
                      </Link>
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </>
            )}
          </Menu>

          <Link
            href="/"
            className="border-t border-dashed py-3.5 text-sm font-medium uppercase text-gray-900 transition first:border-t-0 hover:text-gray-900 dark:border-gray-700 dark:text-white"
            activeClassName="text-gray-900 dark:text-white"
          >
            Feed
          </Link>
          <Link
            href="/"
            className="border-t border-dashed py-3.5 text-sm font-medium uppercase text-gray-900 transition first:border-t-0 hover:text-gray-900 dark:border-gray-700 dark:text-white"
            activeClassName="text-gray-900 dark:text-white"
          >
            Activity
          </Link>

          <Menu>
            {({ open }) => (
              <>
                <Menu.Button className="flex items-center justify-between border-t border-dashed py-3.5 text-justify text-sm font-medium uppercase text-gray-900 transition first:border-t-0 hover:text-gray-900 dark:border-gray-700 dark:text-white dark:hover:text-white">
                  Account
                  {/* <ChevronForward
                    className={`ml-3 transition-transform ${
                      open ? 'rotate-90' : ''
                    }`}
                  /> */}
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="ease-in-out duration-200"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Menu.Items className="">
                    <Menu.Item>
                      <Link
                        href="/"
                        className="mb-3.5 flex items-center text-sm font-normal uppercase text-gray-600 before:mr-3.5 before:block before:h-1 before:w-1 before:shrink-0 before:rounded-full before:bg-gray-600 dark:text-gray-400 dark:before:bg-gray-400 dark:hover:text-white"
                        activeClassName="!text-gray-900 dark:!text-white dark:before:!bg-white before:!bg-gray-900 before:scale-125"
                      >
                        View profile
                      </Link>
                    </Menu.Item>
                    <Menu.Item>
                      <Link
                        href="/"
                        className="mb-3.5 flex items-center text-sm font-normal uppercase text-gray-600 before:mr-3.5 before:block before:h-1 before:w-1 before:shrink-0 before:rounded-full before:bg-gray-600 dark:text-gray-400 dark:before:bg-gray-400 dark:hover:text-white"
                        activeClassName="!text-gray-900 dark:!text-white dark:before:!bg-white before:!bg-gray-900 before:scale-125"
                      >
                        settings
                      </Link>
                    </Menu.Item>
                    <Menu.Item>
                      <Link
                        href="/"
                        className="mb-3.5 flex items-center text-sm font-normal uppercase text-gray-600 before:mr-3.5 before:block before:h-1 before:w-1 before:shrink-0 before:rounded-full before:bg-gray-600 dark:text-gray-400 dark:before:bg-gray-400 dark:hover:text-white"
                        activeClassName="!text-gray-900 dark:!text-white dark:before:!bg-white before:!bg-gray-900 before:scale-125"
                      >
                        help
                      </Link>
                    </Menu.Item>
                    <Menu.Item>
                      <Link
                        href="/"
                        className="mb-3.5 flex items-center text-sm font-normal uppercase text-gray-600 before:mr-3.5 before:block before:h-1 before:w-1 before:shrink-0 before:rounded-full before:bg-gray-600 dark:text-gray-400 dark:before:bg-gray-400 dark:hover:text-white"
                        activeClassName="!text-gray-900 dark:!text-white dark:before:!bg-white before:!bg-gray-900 before:scale-125"
                      >
                        Disconnect
                      </Link>
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </>
            )}
          </Menu>

          <Link
            href="/"
            className="border-t border-dashed py-3.5 text-sm font-medium uppercase text-gray-900 transition first:border-t-0 hover:text-gray-900 dark:border-gray-700 dark:text-white"
            activeClassName="text-gray-900 dark:text-white"
          >
            Notification
          </Link>
        </div>
      {/* </Scrollbar> */}

      <div className="absolute left-0 bottom-4 z-10 w-full  px-6">
        <button>Connect</button>
      </div>
    </div>
  );
}
