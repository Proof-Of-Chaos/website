import Head from 'next/head'
import Image from 'next/image'
import FAQ from '../components/ui/faq'
import Team from '../components/ui/team'
import Layout from '../layouts/layout'

function About() {
  return (
    <>
      <section className="w-full px-8 py-8 pt-24 xl:px-0">
        <div className="flex flex-col max-w-6xl mx-auto md:flex-row">
          <div className="w-full pr-5 md:w-3/12 xl:pr-12">
            <h3 className="text-2xl font-bold leading-7">We will help you increase sales</h3>
          </div>

          <div className="w-full mt-5 md:mt-0 md:w-4/5 md:pl-2">
            <p className="text-base font-normal text-gray-700 md:text-lg">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Soluta debitis hic ullam itaque magnam, harum, autem impedit dolorum porro animi commodi explicabo qui iusto eius eum delectus dolor modi. Quam.
              </p>
          </div>
        </div>
      </section>
      <section className="w-full px-8 py-8 xl:px-0">
        <div className="flex flex-col max-w-6xl mx-auto md:flex-row">
          <div className="w-full pr-5 md:w-3/12 xl:pr-12">
            <h3 className="text-2xl font-bold leading-7">We will help you increase sales</h3>
          </div>
          <div className="w-full mt-5 md:mt-0 md:w-4/5 md:pl-2">
            <p className="text-base font-normal text-gray-700 md:text-lg">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Soluta debitis hic ullam itaque magnam, harum, autem impedit dolorum porro animi commodi explicabo qui iusto eius eum delectus dolor modi. Quam.
              </p>
          </div>
        </div>
      </section>
      <section className="w-full px-8 py-8 xl:px-0">
        <div className="flex flex-col max-w-6xl mx-auto md:flex-row">
          <div className="w-full pr-5 md:w-3/12 xl:pr-12">
            <h3 className="text-2xl font-bold leading-7">We will help you increase sales</h3>
          </div>
          <div className="w-full mt-5 md:mt-0 md:w-4/5 md:pl-2">
            <p className="text-base font-normal text-gray-700 md:text-lg">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Soluta debitis hic ullam itaque magnam, harum, autem impedit dolorum porro animi commodi explicabo qui iusto eius eum delectus dolor modi. Quam.
              </p>
          </div>
        </div>
      </section>
      <FAQ />
      <Team/>
    </>
  )
}

About.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>
}

export default About
