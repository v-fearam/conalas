import { useState, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import styles from './Portfolio.module.css'

const API_URL = import.meta.env.VITE_API_URL ?? ''
const CACHE_KEY = 'portfolio_cache'
const CACHE_TTL_MS = 2 * 60 * 60 * 1000 // 2 horas

interface PortfolioItem {
  id: string
  titulo: string
  descripcion: string
  foto_url: string
  fecha: string
  categoria: string
}

function getCachedPortfolio(): PortfolioItem[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { data, timestamp } = JSON.parse(raw)
    if (Date.now() - timestamp > CACHE_TTL_MS) return null
    return data
  } catch {
    return null
  }
}

function setCachedPortfolio(data: PortfolioItem[]) {
  sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }))
}

export default function Portfolio({ headingTag: Heading = 'h2' }: { headingTag?: 'h1' | 'h2' }) {
  const cached = getCachedPortfolio()
  const [items, setItems] = useState<PortfolioItem[]>(cached ?? [])
  const [loading, setLoading] = useState(cached === null)

  useEffect(() => {
    fetch(`${API_URL}/portfolio`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setItems(data)
          setCachedPortfolio(data)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading || items.length === 0) return null

  return (
    <section id="portfolio" className={styles.portfolio}>
      <div className={styles.container}>
        <span className={styles.badge}>Portfolio</span>
        <Heading className={styles.title}>Nuestros trabajos</Heading>
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
          {items.map((item) => (
            <SwiperSlide key={item.id}>
              <div className={styles.card}>
                <div className={styles.cardImageWrap}>
                  {item.foto_url ? (
                    <img src={item.foto_url} alt={item.titulo} className={styles.cardImage} loading="lazy" />
                  ) : (
                    <div className={styles.cardImagePlaceholder} />
                  )}
                  <span className={styles.cardCategory}>{item.categoria}</span>
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{item.titulo}</h3>
                  <p className={styles.cardDesc}>{item.descripcion}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}
