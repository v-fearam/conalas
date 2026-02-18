import { services } from './data'
import styles from './Services.module.css'

export default function Services() {
  return (
    <section id="servicios" className={styles.services}>
      <div className={styles.container}>
        <span className={styles.badge}>Nuestros Servicios</span>
        <h2 className={styles.title}>Lo que hacemos</h2>
        <p className={styles.subtitle}>
          Cada diseño es único, pensado especialmente para vos
        </p>
        <div className={styles.grid}>
          {services.map((service) => (
            <div key={service.title} className={styles.card}>
              <div className={styles.iconWrap}>{service.icon}</div>
              <h3 className={styles.cardTitle}>{service.title}</h3>
              <p className={styles.cardDesc}>{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
