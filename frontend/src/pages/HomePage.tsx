import Hero from '../components/Hero/Hero'
import SEO from '../components/SEO'

export default function HomePage() {
  return (
    <>
      <SEO
        title="Diseño con Alas — Taller de Comunicación Visual · Bibi Lasala · General Belgrano"
        description="Diseño con Alas — Taller de comunicación visual de Bibi Lasala en General Belgrano, Buenos Aires. Etiquetas escolares, tarjetas personales, vinilo, souvenirs para fiestas, cartelería y diseño gráfico."
        path="/"
      />
      <Hero />
    </>
  )
}
