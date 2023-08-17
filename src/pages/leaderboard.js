import Head from "next/head";
import Image from "next/legacy/image";
import Leaderboard, { DragonLeaderboard } from "../components/nft/leaderboard";
import Layout from "../layouts/layout";
import { Tab } from "@headlessui/react";
import { useState } from "react";
import classNames from "classnames";
import { NextSeo } from "next-seo";

function PageLeaderboard() {
  let [leaderboardTabs] = useState({
    Shelves: <Leaderboard />,
    "Adult Dragons": <DragonLeaderboard />,
  });

  return (
    <>
      <NextSeo
        title="Leaderboards"
        description="See the top collectors of our NFTs that will have benefits"
      />
      <section className="bg-gradient-to-r from-blue-500/80 to-purple-500/80">
        <div className="mx-auto max-w-6xl px-2 sm:px-4 lg:px-8 xl:px-0">
          <div
            className="relative py-12 overflow-hidden rounded-lg g:flex lg:items-center lg:justify-between"
            data-rounded="rounded-lg"
            data-rounded-max="rounded-full"
          >
            <div className="relative p-6 rounded-lg md:p-0 md:pb-4">
              <h2 className="text-3xl font-extrabold leading-9 tracking-tight text-white sm:text-4xl sm:leading-10">
                Leaderboards
              </h2>
              <p
                className="w-full max-w-lg mt-5 text-base leading-8 text-white md:w-3/4"
                data-primary="pink-600"
              >
                Here you can see the top users for shelves and adult dragons. If
                you are connected you can also see your rank. There will
                certainly be some utility for the top ranked wallets soon 👀
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="w-full py-2 md:py-8">
        <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-8 xl:px-0">
          <Tab.Group>
            <Tab.List className="flex mb-6 pb-4 border-brand-600">
              {Object.keys(leaderboardTabs).map((tab, idx) => (
                <Tab
                  key={tab}
                  className={({ selected }) =>
                    classNames(
                      "vote-tab relative w-full py-4 leading-5 border-b-4 rounded-md border-t-2 border-l-2 border-r-2 outline-none uppercase text-base tracking-widest",
                      selected
                        ? "active bg-white border-gray-200 border-b-gray-300"
                        : "text-black border-gray-400 hover:bg-white/[0.12] hover:text-gray-600 border-t-0 border-l-0 border-r-0 border-b-0 hover:bg-gray-100",
                      idx === 0 ? "mr-2" : "ml-2"
                    )
                  }
                >
                  {tab}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels>
              {Object.values(leaderboardTabs).map((tab, idx) => (
                <Tab.Panel key={idx}>{tab}</Tab.Panel>
              ))}
            </Tab.Panels>
          </Tab.Group>
        </div>
      </section>
    </>
  );
}

PageLeaderboard.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default PageLeaderboard;
