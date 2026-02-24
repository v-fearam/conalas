import Portfolio from '../components/Portfolio/Portfolio'
import SEO from '../components/SEO'

const portfolioJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Portfolio de Diseño con Alas',
  description:
    'Trabajos de diseño y comunicación visual realizados por Diseño con Alas en General Belgrano: etiquetas escolares, tarjetas, cartelería en vinilo, souvenirs y más.',
  url: 'https://conalas.vercel.app/portfolio',
  isPartOf: {
    '@type': 'WebSite',
    name: 'Diseño con Alas',
    url: 'https://conalas.vercel.app',
  },
}

export default function PortfolioPage() {
  return (
    <>
      <SEO
        title="Portfolio — Trabajos de Diseño y Comunicación Visual"
        description="Portfolio de Diseño con Alas: etiquetas escolares, tarjetas, cartelería en vinilo, souvenirs para fiestas y más trabajos de comunicación visual realizados en General Belgrano."
        path="/portfolio"
        jsonLd={portfolioJsonLd}
      />
      <Portfolio headingTag="h1" />
    </>
  )
}
