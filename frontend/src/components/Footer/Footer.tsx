import { Link } from 'react-router-dom'
import { FaWhatsapp, FaFacebookF, FaInstagram } from 'react-icons/fa'
import logo from '../../assets/logos/logo-4.jpeg'
import styles from './Footer.module.css'


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
          <Link to="/">Inicio</Link>
          <Link to="/servicios">Servicios</Link>
          <Link to="/portfolio">Portfolio</Link>
          <Link to="/nosotros">Nosotros</Link>
          <Link to="/contacto">Contacto</Link>
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
      </div>
    </footer>
  )
}
