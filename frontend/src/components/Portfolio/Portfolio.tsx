import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { portfolioItems } from './data'
import styles from './Portfolio.module.css'

export default function Portfolio() {
  return (
    <section id="portfolio" className={styles.portfolio}>
      <div className={styles.container}>
        <span className={styles.badge}>Portfolio</span>
        <h2 className={styles.title}>Nuestros trabajos</h2>
        <p className={styles.subtitle}>
          Una muestra de los proyectos que realizamos con dedicación y amor por lo que hacemos.
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
