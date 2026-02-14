import { Link } from 'react-router-dom'
import styles from './Hero.module.css'

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.overlay} />
      <div className={styles.content}>
        <span className={styles.badge}>Taller de ideas · Comunicación visual</span>
        <h1 className={styles.title}>
          Diseño con <span className={styles.accent}>Alas</span>
        </h1>
        <p className={styles.subtitle}>
          Creamos diseños personalizados que dan vida a tus ideas.
          Etiquetas escolares, comerciales, diseños para eventos y mucho más.
        </p>
        <p className={styles.location}>General Belgrano, Buenos Aires</p>
        <Link to="/contacto" className={styles.cta}>
          Contactanos
        </Link>
      </div>
    </section>
  )
}
