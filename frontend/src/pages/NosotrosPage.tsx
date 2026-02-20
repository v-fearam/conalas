import About from '../components/About/About'
import SEO from '../components/SEO'

export default function NosotrosPage() {
  return (
    <>
      <SEO
        title="Nosotros — Bibi Lasala · Taller Familiar de Diseño"
        description="Conocé a Bibi Lasala y el taller familiar Diseño con Alas en General Belgrano. Comunicación visual con calidez artesanal para emprendedores, comercios y eventos especiales."
        path="/nosotros"
      />
      <About />
    </>
  )
}
