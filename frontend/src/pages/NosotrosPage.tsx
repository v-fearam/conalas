import About from '../components/About/About'
import SEO from '../components/SEO'

const aboutJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'Nosotros — Diseño con Alas',
  description:
    'Conocé a Bibi Lasala y el taller familiar Diseño con Alas en General Belgrano. Comunicación visual con calidez artesanal.',
  url: 'https://conalas.vercel.app/nosotros',
  mainEntity: {
    '@type': 'LocalBusiness',
    name: 'Diseño con Alas',
    founder: {
      '@type': 'Person',
      name: 'Bibi Lasala',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'General Belgrano',
      addressRegion: 'Buenos Aires',
      addressCountry: 'AR',
    },
  },
}

export default function NosotrosPage() {
  return (
    <>
      <SEO
        title="Nosotros — Bibi Lasala · Taller Familiar de Diseño"
        description="Conocé a Bibi Lasala y el taller familiar Diseño con Alas en General Belgrano. Comunicación visual con calidez artesanal para emprendedores, comercios y eventos especiales."
        path="/nosotros"
        jsonLd={aboutJsonLd}
      />
      <About headingTag="h1" />
    </>
  )
}
