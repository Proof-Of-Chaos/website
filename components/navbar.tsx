"use client";

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
import { Button } from "@nextui-org/button";
import { usePathname } from "next/navigation";

export const Navbar = () => {
  const pathname = usePathname();

  return (
    <NextUINavbar
      maxWidth="xl"
      position="sticky"
      classNames={{
        item: [
          "flex",
          "relative",
          "h-full",
          "items-center",
          "data-[active=true]:after:content-['']",
          "data-[active=true]:after:absolute",
          "data-[active=true]:after:-bottom-1",
          "data-[active=true]:after:left-0",
          "data-[active=true]:after:right-0",
          "data-[active=true]:after:h-[3px]",
          "data-[active=true]:after:bg-gradient-to-r",
          "data-[active=true]:after:from-sky-500",
          "data-[active=true]:after:to-purple-400",
        ],
      }}
    >
      <NavbarContent className="lg:hidden flex-grow-0" justify="center">
        <NavbarMenuToggle />
      </NavbarContent>
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            {/* <Logo className="mr-1" /> */}
            <p className="hidden font-bold sm:flex -mt-1 text-3xl bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-purple-500">
              proofofchaos
            </p>
            {/* p̸̤̈́r̶͖͐ơ̵̳ȯ̵͙f̵͔̔ò̵̝f̴̝̈́ć̶̖h̸̻͒a̶͙̚o̷̩͛s̵̠̏ */}
            <p className="sm:hidden font-bold -mt-1 text-3xl bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-purple-500">
              poc
            </p>
          </NextLink>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-4 justify-start ml-4 font-bold">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href} isActive={pathname.includes(item.href)}>
              {item.chainLink ? (
                <ChainLink
                  className={clsx(
                    // linkStyles({ color: "foreground" }),
                    "text-lg font-bold"
                  )}
                  color="foreground"
                  href={item.href}
                >
                  {item.label}
                </ChainLink>
              ) : (
                <Link
                  className={clsx(
                    // linkStyles({ color: "foreground" }),
                    "text-lg font-bold"
                  )}
                  color="foreground"
                  href={item.href}
                >
                  {item.label}
                </Link>
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
          {siteConfig.navItems.map((item, index) => (
            <NavbarMenuItem key={item.href}>
              {item.chainLink ? (
                <ChainLink
                  className={clsx(
                    linkStyles({ color: "foreground" }),
                    "!text-2xl data-[active=true]:text-primary data-[active=true]:font-bold"
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
                    "!text-2xl data-[active=true]:text-primary data-[active=true]:font-bold"
                  )}
                  color="foreground"
                  href={item.href}
                >
                  {item.label}
                </NextLink>
              )}
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </NextUINavbar>
  );
};
