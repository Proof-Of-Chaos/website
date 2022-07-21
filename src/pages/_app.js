import Head from 'next/head';
import { ThemeProvider } from 'next-themes';
import '../../styles/globals.css'
import ModalsContainer from '../components/modals/container';

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
        {getLayout(<Component {...pageProps} />)}
        <ModalsContainer />
    </>
  )
}

export default MyApp