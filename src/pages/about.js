import Head from 'next/head'
import Image from 'next/image'
import FAQ from '../components/ui/faq'
import Team from '../components/ui/team'
import Layout from '../layouts/layout'

function About() {
  return (
    <>
      <FAQ />
      <Team/>
    </>
  )
}

About.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>
}

export default About
