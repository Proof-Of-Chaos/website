import Layout from '../layouts/layout'
import Loader from '../components/ui/loader';

function Test() {
  return <div>
    <Loader />
  </div>
}

Test.getLayout = function getLayout(page){
  return <Layout>{page}</Layout>
}

export default Test
