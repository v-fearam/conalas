import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import styles from './Portfolio.module.css'

import imgLlaveros from '../../assets/portfolio/llaveros.jpg'
import imgDelantal1 from '../../assets/portfolio/Delantal1.jpg'
import imgDelantal2 from '../../assets/portfolio/Delantal2.jpg'
import imgStiker1 from '../../assets/portfolio/StikerTapasCuaderno.jpg'
import imgStiker2 from '../../assets/portfolio/StikerTapaCuaderno2.jpg'
import imgComunion1 from '../../assets/portfolio/EstampitasYBolsaComunion.jpg'
import imgComunion2 from '../../assets/portfolio/EstampitasYBolsaComunion2.jpg'
import imgComunion3 from '../../assets/portfolio/EstampitasYBolsaComunion3.jpg'
import imgCartel from '../../assets/portfolio/Cartel1.jpg'
import imgAlmanaque from '../../assets/portfolio/Almanaque1.jpg'
import imgTarjetaBolsa from '../../assets/portfolio/TarjetaBolsaNegocio.jpg'
import imgVinilo from '../../assets/portfolio/ViniloCartel.jpg'
import imgLetras from '../../assets/portfolio/LetrasViniloRecortadas.jpg'
import imgTarjetas from '../../assets/portfolio/TarjetasPersonales1.jpg'

const portfolioItems = [
  {
    title: 'Llaveros Personalizados',
    category: 'Souvenirs',
    description: 'Llaveros con nombre y diseño personalizado, ideales como souvenir para eventos y regalos.',
    image: imgLlaveros,
  },
  {
    title: 'Delantales para Negocios',
    category: 'Indumentaria Comercial',
    description: 'Delantales estampados con logo y marca para comercios locales como La Granjita.',
    image: imgDelantal1,
  },
  {
    title: 'Stickers para Cuadernos',
    category: 'Etiquetas Escolares',
    description: 'Stickers personalizados para tapas de cuadernos con nombre, grado y diseño temático.',
    image: imgStiker1,
  },
  {
    title: 'Kit Comunión Ornella',
    category: 'Eventos Religiosos',
    description: 'Estampitas, bolsas y souvenirs personalizados para Primera Comunión.',
    image: imgComunion1,
  },
  {
    title: 'Cartelería Comercial',
    category: 'Cartelería',
    description: 'Diseño de carteles publicitarios para comercios locales con identidad visual completa.',
    image: imgCartel,
  },
  {
    title: 'Almanaques Personalizados',
    category: 'Cartelería',
    description: 'Almanaques con diseño a medida para negocios, con datos de contacto y branding.',
    image: imgAlmanaque,
  },
  {
    title: 'Tarjetas y Bolsas',
    category: 'Papelería Comercial',
    description: 'Tarjetas caladas con mensajes personalizados, ideales para fin de año y fechas especiales.',
    image: imgTarjetaBolsa,
  },
  {
    title: 'Vinilo y Cartelería',
    category: 'Cartelería',
    description: 'Diseño de marca y cartelería en vinilo para vidriera y espacios comerciales.',
    image: imgVinilo,
  },
  {
    title: 'Letras en Vinilo Recortado',
    category: 'Cartelería',
    description: 'Letras y logos en vinilo de corte para frascos, vidrieras y decoración de espacios.',
    image: imgLetras,
  },
  {
    title: 'Tarjetas Personales',
    category: 'Papelería Comercial',
    description: 'Tarjetas de presentación profesionales con diseño personalizado para emprendedores.',
    image: imgTarjetas,
  },
  {
    title: 'Delantal Cafetería',
    category: 'Indumentaria Comercial',
    description: 'Delantales personalizados con tipografía y marca para cafeterías y restaurantes.',
    image: imgDelantal2,
  },
  {
    title: 'Sticker Escolar Temático',
    category: 'Etiquetas Escolares',
    description: 'Etiquetas escolares con personajes y diseño colorido para identificar útiles y carpetas.',
    image: imgStiker2,
  },
  {
    title: 'Comunión Floral',
    category: 'Eventos Religiosos',
    description: 'Kit completo de comunión con diseño floral: estampitas, bolsas y señaladores.',
    image: imgComunion2,
  },
  {
    title: 'Comunión Celeste',
    category: 'Eventos Religiosos',
    description: 'Estampitas y bolsas para comunión con diseño elegante en tonos celeste y dorado.',
    image: imgComunion3,
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
                <div className={styles.cardImageWrap}>
                  <img src={item.image} alt={item.title} className={styles.cardImage} loading="lazy" />
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
