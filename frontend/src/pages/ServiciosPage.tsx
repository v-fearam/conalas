import Services from '../components/Services/Services'
import SEO from '../components/SEO'

const servicesJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Servicios de Diseño con Alas',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      item: {
        '@type': 'Service',
        name: 'Etiquetas Escolares',
        description:
          'Stickers y etiquetas personalizadas para cuadernos, útiles y mochilas con el nombre y diseño que elijas.',
      },
    },
    {
      '@type': 'ListItem',
      position: 2,
      item: {
        '@type': 'Service',
        name: 'Cartelería y Almanaques',
        description:
          'Carteles publicitarios, almanaques y folletería con diseño profesional para tu negocio o emprendimiento.',
      },
    },
    {
      '@type': 'ListItem',
      position: 3,
      item: {
        '@type': 'Service',
        name: 'Tarjetas Personales y Papelería Comercial',
        description:
          'Tarjetas personales, tarjetas de presentación y papelería con identidad visual para comercios.',
      },
    },
    {
      '@type': 'ListItem',
      position: 4,
      item: {
        '@type': 'Service',
        name: 'Souvenirs para Fiestas y Eventos Religiosos',
        description:
          'Estampitas, bolsas y souvenirs personalizados para comuniones, bautismos, confirmaciones y fiestas.',
      },
    },
    {
      '@type': 'ListItem',
      position: 5,
      item: {
        '@type': 'Service',
        name: 'Indumentaria y Vinilo',
        description:
          'Delantales estampados, letras en vinilo recortado y cartelería en vinilo para comercios.',
      },
    },
  ],
}

export default function ServiciosPage() {
  return (
    <>
      <SEO
        title="Servicios — Etiquetas Escolares, Tarjetas, Vinilo y más"
        description="Servicios de Diseño con Alas: etiquetas escolares, tarjetas personales, vinilo recortado, souvenirs para fiestas, cartelería, almanaques y diseño gráfico en General Belgrano."
        path="/servicios"
        jsonLd={servicesJsonLd}
      />
      <Services />
    </>
  )
}
