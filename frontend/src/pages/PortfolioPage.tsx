import Portfolio from '../components/Portfolio/Portfolio'
import SEO from '../components/SEO'

export default function PortfolioPage() {
  return (
    <>
      <SEO
        title="Portfolio — Trabajos de Diseño y Comunicación Visual"
        description="Portfolio de Diseño con Alas: etiquetas escolares, tarjetas, cartelería en vinilo, souvenirs para fiestas y más trabajos de comunicación visual realizados en General Belgrano."
        path="/portfolio"
      />
      <Portfolio />
    </>
  )
}
