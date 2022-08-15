import Head from 'next/head';
import { ThemeProvider } from 'next-themes';
import '../../styles/globals.css'
import '@talisman-connect/components/talisman-connect-components.esm.css';
import '@talisman-connect/ui/talisman-connect-ui.esm.css';
import ModalsContainer from '../components/modals/container';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DrawersContainer from '../components/drawer/container';

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
      <DrawersContainer />
      <ModalsContainer />
      <ToastContainer />
    </>
  )
}

export default MyApp
