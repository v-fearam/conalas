import { FaTag, FaPrint, FaStore, FaChurch, FaGift, FaTshirt } from 'react-icons/fa'
import styles from './Services.module.css'

const services = [
  {
    icon: <FaTag />,
    title: 'Etiquetas Escolares',
    description:
      'Stickers y etiquetas personalizadas para cuadernos, útiles y mochilas con el nombre y diseño que elijas.',
  },
  {
    icon: <FaPrint />,
    title: 'Cartelería y Almanaques',
    description:
      'Carteles publicitarios, almanaques y folletería con diseño profesional para tu negocio o emprendimiento.',
  },
  {
    icon: <FaStore />,
    title: 'Papelería Comercial',
    description:
      'Tarjetas personales, tarjetas de presentación y papelería con identidad visual para comercios.',
  },
  {
    icon: <FaChurch />,
    title: 'Eventos Religiosos',
    description:
      'Estampitas, bolsas y souvenirs personalizados para comuniones, bautismos y confirmaciones.',
  },
  {
    icon: <FaGift />,
    title: 'Souvenirs y Regalos',
    description:
      'Llaveros, tarjetas caladas y regalos personalizados para eventos, cumpleaños y fechas especiales.',
  },
  {
    icon: <FaTshirt />,
    title: 'Indumentaria y Vinilo',
    description:
      'Delantales estampados, letras en vinilo recortado y cartelería en vinilo para comercios.',
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
