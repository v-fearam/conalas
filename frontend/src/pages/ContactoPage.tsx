import Contact from '../components/Contact/Contact'
import SEO from '../components/SEO'

export default function ContactoPage() {
  return (
    <>
      <SEO
        title="Contacto — Pedí tu Presupuesto"
        description="Contactá a Diseño con Alas en General Belgrano. Pedí tu presupuesto para etiquetas escolares, tarjetas, vinilo, souvenirs para fiestas y más servicios de comunicación visual."
        path="/contacto"
      />
      <Contact />
    </>
  )
}
