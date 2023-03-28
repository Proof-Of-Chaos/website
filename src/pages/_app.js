import Head from 'next/head';
import { useEffect } from 'react';
import ModalsContainer from '../components/modals/container';
import { Toaster, ToastBar } from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';
import DrawersContainer from '../components/drawer/container';
import seoConfig from '../next-seo.config' 
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { DefaultSeo } from 'next-seo';
import PolkadotApiProvider from '../context/polkadot-api-context';
import { useVoteManager } from '../hooks/use-vote-manager';
import useAppStore from '../zustand';

import '../../styles/globals.scss'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      //globally default to 20 seconds
      staleTime: 1000 * 30,
    },
  },
})

function MyApp({ Component, pageProps }) {
  const getLayout = Component.getLayout ?? ((page) => page)
  const voteManager = useVoteManager()
  const clearVoteState = useAppStore((state) => state.clearVoteState )

  useEffect(() => {
    clearVoteState()
  }, [])
  
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1 maximum-scale=1"
        />
      </Head>
      <QueryClientProvider client={queryClient}>
        <DefaultSeo
          { ...seoConfig }
        />
        <PolkadotApiProvider>
          {getLayout(<Component {...pageProps} />)}
        </PolkadotApiProvider>
        <DrawersContainer />
        <ModalsContainer />
        {/* <ToastContainer /> */}
        <Toaster
          className="toaster"
          position="top-right"
          toastOptions={{
            style: {
              width: '300px',
              minHeight: '70px',
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
        {/* <ReactQueryDevtools initialIsOpen /> */}
      </QueryClientProvider>
    </>
  )
}

export default MyApp
