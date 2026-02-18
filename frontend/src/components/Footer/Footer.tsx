import { SOCIAL_LINKS } from '../../constants/site'
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

        <div className={styles.social}>
          <h4 className={styles.linksTitle}>Redes sociales</h4>
          <div className={styles.socialIcons}>
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
              >
                <link.icon />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>&copy; {year} Diseño con Alas. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}
