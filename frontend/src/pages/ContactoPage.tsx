import Contact from '../components/Contact/Contact'
import SEO from '../components/SEO'

const contactJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contacto — Diseño con Alas',
  description:
    'Contactá a Diseño con Alas en General Belgrano para pedir tu presupuesto de diseño y comunicación visual.',
  url: 'https://conalas.vercel.app/contacto',
  mainEntity: {
    '@type': 'LocalBusiness',
    name: 'Diseño con Alas',
    telephone: '+542243401378',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'General Belgrano',
      addressRegion: 'Buenos Aires',
      addressCountry: 'AR',
    },
  },
}

export default function ContactoPage() {
  return (
    <>
      <SEO
        title="Contacto — Pedí tu Presupuesto"
        description="Contactá a Diseño con Alas en General Belgrano. Pedí tu presupuesto para etiquetas escolares, tarjetas, vinilo, souvenirs para fiestas y más servicios de comunicación visual."
        path="/contacto"
        jsonLd={contactJsonLd}
      />
      <Contact headingTag="h1" />
    </>
  )
}
