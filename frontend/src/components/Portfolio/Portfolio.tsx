import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import styles from './Portfolio.module.css'

const portfolioItems = [
  {
    title: 'Set Escolar Dinosaurios',
    category: 'Etiquetas Escolares',
    description: 'Diseño temático de dinosaurios para etiquetas de útiles, mochilas y cuadernos.',
    color: '#E91E7B',
  },
  {
    title: 'Etiquetas Panadería Artesanal',
    category: 'Etiquetas Comerciales',
    description: 'Sistema de etiquetado completo para panadería local con identidad visual propia.',
    color: '#F5A623',
  },
  {
    title: 'Kit Cumpleaños Unicornios',
    category: 'Eventos',
    description: 'Invitaciones, banderines y cartelería para cumpleaños infantil temático.',
    color: '#4ECDC4',
  },
  {
    title: 'Separadores Florales',
    category: 'Separadores',
    description: 'Colección de separadores con diseño floral acuarela para carpetas escolares.',
    color: '#2B3A67',
  },
  {
    title: 'Branding Almacén Natural',
    category: 'Etiquetas Comerciales',
    description: 'Etiquetas de producto y precios con estilo orgánico y natural.',
    color: '#E91E7B',
  },
  {
    title: 'Kit Bautismo Angelitos',
    category: 'Eventos',
    description: 'Diseño integral para bautismo: invitaciones, souvenirs y decoración.',
    color: '#F5A623',
  },
]

export default function Portfolio() {
  return (
    <section id="portfolio" className={styles.portfolio}>
      <div className={styles.container}>
        <span className={styles.badge}>Portfolio</span>
        <h2 className={styles.title}>Nuestros trabajos</h2>
        <p className={styles.subtitle}>
          Una muestra de lo que creamos con dedicación y creatividad
        </p>
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={24}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className={styles.swiper}
        >
          {portfolioItems.map((item) => (
            <SwiperSlide key={item.title}>
              <div className={styles.card}>
                <div
                  className={styles.cardImage}
                  style={{ background: `linear-gradient(135deg, ${item.color}22, ${item.color}44)` }}
                >
                  <span className={styles.cardCategory}>{item.category}</span>
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <p className={styles.cardDesc}>{item.description}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}
