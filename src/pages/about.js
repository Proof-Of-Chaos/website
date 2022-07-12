import Head from 'next/head'
import Image from 'next/image'
import FAQ from '../components/ui/faq'
import Layout from '../layouts/layout'

function About() {
  return (
    <>
      <FAQ />
    </>
  )
}

About.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>
}

export default About
