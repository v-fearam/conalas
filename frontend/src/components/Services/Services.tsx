import { FaTag, FaFolderOpen, FaStore, FaBirthdayCake } from 'react-icons/fa'
import styles from './Services.module.css'

const services = [
  {
    icon: <FaTag />,
    title: 'Etiquetas Escolares',
    description:
      'Etiquetas personalizadas para útiles, mochilas y cuadernos. Diseños únicos con el nombre de tu hijo/a.',
  },
  {
    icon: <FaFolderOpen />,
    title: 'Separadores de Carpetas',
    description:
      'Organizá tus carpetas con separadores diseñados a medida. Ideales para estudiantes y profesionales.',
  },
  {
    icon: <FaStore />,
    title: 'Etiquetas Comerciales',
    description:
      'Etiquetas de precios, productos e identificación para tu comercio. Dale una imagen profesional a tu negocio.',
  },
  {
    icon: <FaBirthdayCake />,
    title: 'Diseños para Eventos',
    description:
      'Invitaciones, decoración y diseños especiales para cumpleaños, bautismos y todo tipo de eventos.',
  },
]

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
