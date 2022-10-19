import Head from 'next/head';
import '../../styles/globals.scss'
import '@talisman-connect/components/talisman-connect-components.esm.css';
import '@talisman-connect/ui/talisman-connect-ui.esm.css';
import ModalsContainer from '../components/modals/container';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DrawersContainer from '../components/drawer/container';
import seoConfig from '../next-seo.config' 

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { DefaultSeo, NextSeo } from 'next-seo';

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
        {getLayout(<Component {...pageProps} />)}
        <DrawersContainer />
        <ModalsContainer />
        <ToastContainer />
        {/* <ReactQueryDevtools initialIsOpen /> */}
      </QueryClientProvider>
    </>
  )
}

export default MyApp
