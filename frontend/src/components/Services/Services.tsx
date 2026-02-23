import { useState, useEffect } from 'react'
import { FaTag, FaPrint, FaStore, FaChurch, FaGift, FaTshirt, FaStar, FaBezierCurve } from 'react-icons/fa'
import type { IconType } from 'react-icons'
import styles from './Services.module.css'

const API_URL = import.meta.env.VITE_API_URL ?? ''
const CACHE_KEY = 'services_cache'
const CACHE_TTL_MS = 2 * 60 * 60 * 1000 // 2 horas

const iconMap: Record<string, IconType> = {
  FaTag, FaPrint, FaStore, FaChurch, FaGift, FaTshirt, FaStar, FaBezierCurve,
}

interface ServiceData {
  id: string
  titulo: string
  descripcion: string
  icono: string
  orden: number
}

function getCachedServices(): ServiceData[] | null {
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

function setCachedServices(data: ServiceData[]) {
  sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }))
}

export default function Services() {
  const cached = getCachedServices()
  const [services, setServices] = useState<ServiceData[]>(cached ?? [])
  const [loading, setLoading] = useState(cached === null)

  useEffect(() => {
    fetch(`${API_URL}/services`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setServices(data)
          setCachedServices(data)
        }
      })
      .catch(() => { })
      .finally(() => setLoading(false))
  }, [])

  if (loading || services.length === 0) return null

  return (
    <section id="servicios" className={styles.services}>
      <div className={styles.container}>
        <span className={styles.badge}>Nuestros Servicios</span>
        <h2 className={styles.title}>Lo que hacemos</h2>
        <p className={styles.subtitle}>
          Estamos para ayudarte a que cada detalle sea exactamente como lo soñaste.
          Te asesoramos con calidez y profesionalismo.
        </p>
        <div className={styles.grid}>
          {services.map((service) => {
            const Icon = iconMap[service.icono] ?? FaStar
            return (
              <div key={service.id} className={styles.card}>
                <div className={styles.iconWrap}>
                  <Icon />
                </div>
                <h3 className={styles.cardTitle}>{service.titulo}</h3>
                <p className={styles.cardDesc}>{service.descripcion}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
