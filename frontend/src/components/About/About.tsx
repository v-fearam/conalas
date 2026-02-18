import { values } from './data'
import styles from './About.module.css'

export default function About() {
  return (
    <section id="nosotros" className={styles.about}>
      <div className={styles.container}>
        <div className={styles.text}>
          <span className={styles.badge}>Sobre Nosotros</span>
          <h2 className={styles.title}>Diseño con Alas</h2>
          <p className={styles.description}>
            Somos un taller de ideas y comunicación visual en General Belgrano, Buenos Aires.
            Nos especializamos en crear diseños personalizados que hacen que cada producto
            sea especial y único.
          </p>
          <p className={styles.description}>
            Desde etiquetas escolares hasta diseños para eventos, nuestro compromiso es
            brindar un servicio cercano, creativo y de calidad. Trabajamos codo a codo con
            cada cliente para que el resultado final supere sus expectativas.
          </p>
        </div>
        <div className={styles.values}>
          {values.map((value) => (
            <div key={value.title} className={styles.valueCard}>
              <div className={styles.valueIcon}>{value.icon}</div>
              <div>
                <h3 className={styles.valueTitle}>{value.title}</h3>
                <p className={styles.valueText}>{value.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
