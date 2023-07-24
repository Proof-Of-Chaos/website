import Head from "next/head";
import { useEffect, useState } from "react";
import ModalsContainer from "../components/modals/container";
import { Toaster, ToastBar } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import DrawersContainer from "../components/drawer/container";
import seoConfig from "../next-seo.config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DefaultSeo } from "next-seo";
import PolkadotApiProvider from "../context/polkadot-api-context";
import useAppStore from "../zustand";
import { Analytics } from "@vercel/analytics/react";

import "../../styles/globals.scss";

function MyApp({ Component, pageProps }) {
  const [queryClient] = useState(() => new QueryClient());
  const getLayout = Component.getLayout ?? ((page) => page);
  const clearVoteState = useAppStore((state) => state.clearVoteState);

  useEffect(() => {
    clearVoteState();
  }, []);

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1 maximum-scale=1"
        />
      </Head>

      <DefaultSeo {...seoConfig} />

      <PolkadotApiProvider>
        <QueryClientProvider client={queryClient}>
          {getLayout(<Component {...pageProps} />)}
          <ModalsContainer />
          <DrawersContainer />
          <Toaster
            className="toaster"
            position="top-right"
            toastOptions={{
              style: {
                width: "300px",
                minHeight: "70px",
              },
            }}
          >
            {(t) => (
              <ToastBar toast={t} className="toaster-bar">
                {({ icon, message }) => (
                  <>
                    {icon}
                    <div className="message flex flex-col mx-3 text-sm">
                      <span className="font-bold">{t.title}</span>
                      {message}
                    </div>
                  </>
                )}
              </ToastBar>
            )}
          </Toaster>
        </QueryClientProvider>
      </PolkadotApiProvider>
      <Analytics />
      {/* <ReactQueryDevtools initialIsOpen /> */}
    </>
  );
}

export default MyApp;
