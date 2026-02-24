import { values } from './data'
import styles from './About.module.css'

export default function About({ headingTag: Heading = 'h2' }: { headingTag?: 'h1' | 'h2' }) {
  return (
    <section id="nosotros" className={styles.about}>
      <div className={styles.container}>
        <div className={styles.text}>
          <span className={styles.badge}>Nuestra Historia</span>
          <Heading className={styles.title}>Diseño con Alas: Pasión en Familia</Heading>
          <p className={styles.description}>
            Somos un taller familiar nacido en General Belgrano, impulsado por el deseo de ponerle alas a la creatividad.
            Creeremos que los mejores resultados nacen de la dedicación y el trato cercano, por eso cada proyecto que llega
            a nuestras manos recibe toda nuestra atención y cariño.
          </p>
          <p className={styles.description}>
            Nuestra misión es brindarte soluciones creativas que reflejen tu esencia.
            Nos enorgullece ser parte de tu crecimiento, ya sea impulsando la imagen de tu negocio
            o creando los detalles para los eventos más importantes de tu vida. Estamos acá para escucharte y crear juntos.
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
