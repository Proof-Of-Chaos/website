import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@nextui-org/navbar";
import { Link } from "@nextui-org/link";

import { link as linkStyles } from "@nextui-org/theme";

import { siteConfig } from "@/config/site";
import NextLink from "next/link";
import clsx from "clsx";

import { ThemeSwitch } from "@/components/theme-switch";
import {
  TwitterIcon,
  GithubIcon,
  DiscordIcon,
  HeartFilledIcon,
} from "@/components/icons";

import { Logo as ChaosLogo } from "@/components/logo";
import { Logo } from "@/components/icons";
import { ChainSwitch } from "./chain-switch";
import { WalletConnect } from "./wallet-connect";
import { ChainLink } from "./chain-link";

export const Navbar = () => {
  return (
    <NextUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="lg:hidden flex-grow-0" justify="center">
        <NavbarMenuToggle />
      </NavbarContent>
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            {/* <Logo className="mr-1" /> */}
            <p className="hidden font-bold sm:flex -mt-1 text-3xl bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-purple-500">
              p̶̪̾r̸̼͋o̷̜͗o̷̩̔f̴͚̋o̸̥̍f̸̝͛c̶͈͒h̷͎͠a̴̱͐o̴̜̓s̷͚̈
            </p>
            {/* p̸̤̈́r̶͖͐ơ̵̳ȯ̵͙f̵͔̔ò̵̝f̴̝̈́ć̶̖h̸̻͒a̶͙̚o̷̩͛s̵̠̏ */}
            <p className="sm:hidden font-bold -mt-1 text-3xl bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-purple-500">
              p̸̤̈́ò̵̝ć̶̖
            </p>
          </NextLink>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-4 justify-start ml-4 font-bold">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              {item.chainLink ? (
                <ChainLink
                  className={clsx(
                    linkStyles({ color: "foreground" }),
                    "text-lg data-[active=true]:text-primary data-[active=true]:font-bold"
                  )}
                  color="foreground"
                  href={item.href}
                >
                  {item.label}
                </ChainLink>
              ) : (
                <NextLink
                  className={clsx(
                    linkStyles({ color: "foreground" }),
                    "text-lg data-[active=true]:text-primary data-[active=true]:font-bold"
                  )}
                  color="foreground"
                  href={item.href}
                >
                  {item.label}
                </NextLink>
              )}
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent className="lg:hidden pl-4" justify="end">
        <ThemeSwitch className="flex lg:hidden" />
      </NavbarContent>

      <NavbarContent
        className="flex basis-1/5 sm:basis-full !flex-grow-0"
        justify="end"
      >
        <NavbarItem className="hidden lg:flex gap-2">
          <Link isExternal href={siteConfig.links.twitter} aria-label="Twitter">
            <TwitterIcon className="text-default-500" />
          </Link>
          <Link isExternal href={siteConfig.links.discord} aria-label="Discord">
            <DiscordIcon className="text-default-500" />
          </Link>
          <Link isExternal href={siteConfig.links.github} aria-label="Github">
            <GithubIcon className="text-default-500" />
          </Link>
          <ThemeSwitch />
        </NavbarItem>
        <NavbarItem className="flex flex-row gap-2">
          <ChainSwitch />
          <WalletConnect />
        </NavbarItem>
      </NavbarContent>

      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                color={
                  index === 2
                    ? "primary"
                    : index === siteConfig.navMenuItems.length - 1
                    ? "danger"
                    : "foreground"
                }
                href="#"
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </NextUINavbar>
  );
};