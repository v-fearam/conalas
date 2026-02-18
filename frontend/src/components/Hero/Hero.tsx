import { Link } from 'react-router-dom'
import styles from './Hero.module.css'

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.overlay} />
      <div className={styles.content}>
        <span className={styles.badge}>Taller Familiar de Ideas · Comunicación Visual</span>
        <h1 className={styles.title}>
          Diseño con <span className={styles.accent}>Alas</span>
        </h1>
        <p className={styles.subtitle}>
          Transformamos tus ideas en detalles únicos con la calidez de un taller familiar.
          Diseños pensados para acompañar tus proyectos y momentos más especiales.
        </p>
        <p className={styles.location}>General Belgrano, Buenos Aires</p>
        <Link to="/contacto" className={styles.cta}>
          Consultanos sin compromiso
        </Link>
      </div>
    </section>
  )
}
