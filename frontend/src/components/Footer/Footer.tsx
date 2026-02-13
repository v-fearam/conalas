import { useEffect, useState } from 'react'
import { FaWhatsapp, FaFacebookF, FaInstagram } from 'react-icons/fa'
import logo from '../../assets/logos/logo-4.jpeg'
import styles from './Footer.module.css'

const API_URL = import.meta.env.VITE_API_URL as string

function ApiStatus() {
  const [status, setStatus] = useState<'checking' | 'ok' | 'error'>('checking')

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((res) => res.json())
      .then((data) => setStatus(data.status ? 'ok' : 'error'))
      .catch(() => setStatus('error'))
  }, [])

  const color = status === 'ok' ? '#4ade80' : status === 'error' ? '#f87171' : '#fbbf24'
  const label = status === 'ok' ? 'API OK' : status === 'error' ? 'API DOWN' : 'Checking...'

  return (
    <div className={styles.apiStatus}>
      <span className={styles.apiDot} style={{ background: color }} />
      <span style={{ color }}>{label}</span>
      <span className={styles.apiUrl}>{API_URL}</span>
    </div>
  )
}

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <img src={logo} alt="Diseño con Alas" className={styles.logo} />
          <p className={styles.tagline}>Taller de ideas · Comunicación visual</p>
          <p className={styles.location}>General Belgrano, Buenos Aires, Argentina</p>
        </div>

        <div className={styles.links}>
          <h4 className={styles.linksTitle}>Navegación</h4>
          <a href="#inicio">Inicio</a>
          <a href="#servicios">Servicios</a>
          <a href="#portfolio">Portfolio</a>
          <a href="#nosotros">Nosotros</a>
          <a href="#contacto">Contacto</a>
        </div>

        <div className={styles.social}>
          <h4 className={styles.linksTitle}>Redes sociales</h4>
          <div className={styles.socialIcons}>
            <a
              href="https://www.facebook.com/disenio.con.alas"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://wa.me/542243401378"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <FaWhatsapp />
            </a>
            <a
              href="https://www.instagram.com/disenio.con.alas"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>&copy; {year} Diseño con Alas. Todos los derechos reservados.</p>
        {import.meta.env.DEV && <ApiStatus />}
      </div>
    </footer>
  )
}
