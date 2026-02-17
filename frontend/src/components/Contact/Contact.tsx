import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Turnstile, type TurnstileInstance } from 'react-turnstile'
import { FaWhatsapp, FaFacebookF, FaInstagram, FaMapMarkerAlt, FaPhone } from 'react-icons/fa'
import styles from './Contact.module.css'

const API_URL = import.meta.env.VITE_API_URL as string
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string

interface FormData {
  nombre: string
  email: string
  telefono: string
  mensaje: string
}

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileInstance>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    if (!turnstileToken) {
      setSendError('Por favor, completá la verificación de seguridad.')
      return
    }

    setSending(true)
    setSendError(null)
    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, turnstileToken }),
      })
      if (!res.ok) throw new Error('Error al enviar')
      setSubmitted(true)
      reset()
      setTurnstileToken(null)
      turnstileRef.current?.reset()
      setTimeout(() => setSubmitted(false), 5000)
    } catch {
      setSendError('No se pudo enviar el mensaje. Intentá de nuevo.')
      setTurnstileToken(null)
      turnstileRef.current?.reset()
    } finally {
      setSending(false)
    }
  }

  return (
    <section id="contacto" className={styles.contact}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.badge}>Contacto</span>
          <h2 className={styles.title}>Hablemos de tu proyecto</h2>
          <p className={styles.subtitle}>
            Contanos tu idea y te ayudamos a hacerla realidad
          </p>
        </div>

        <div className={styles.grid}>
          <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.field}>
              <label htmlFor="nombre" className={styles.label}>Nombre completo *</label>
              <input
                id="nombre"
                type="text"
                maxLength={100}
                className={`${styles.input} ${errors.nombre ? styles.inputError : ''}`}
                placeholder="Tu nombre"
                {...register('nombre', { required: 'El nombre es obligatorio' })}
              />
              {errors.nombre && <span className={styles.error}>{errors.nombre.message}</span>}
            </div>

            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>Email *</label>
              <input
                id="email"
                type="email"
                maxLength={254}
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                placeholder="tu@email.com"
                {...register('email', {
                  required: 'El email es obligatorio',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido',
                  },
                })}
              />
              {errors.email && <span className={styles.error}>{errors.email.message}</span>}
            </div>

            <div className={styles.field}>
              <label htmlFor="telefono" className={styles.label}>Teléfono *</label>
              <input
                id="telefono"
                type="tel"
                className={`${styles.input} ${errors.telefono ? styles.inputError : ''}`}
                placeholder="Ej: 2243401378"
                {...register('telefono', {
                  required: 'El teléfono es obligatorio',
                  pattern: {
                    value: /^[\d\s\-+()]{7,20}$/,
                    message: 'Número de teléfono inválido',
                  },
                })}
              />
              {errors.telefono && <span className={styles.error}>{errors.telefono.message}</span>}
            </div>

            <div className={styles.field}>
              <label htmlFor="mensaje" className={styles.label}>Mensaje</label>
              <textarea
                id="mensaje"
                maxLength={2000}
                className={styles.textarea}
                placeholder="Contanos sobre tu proyecto..."
                rows={4}
                {...register('mensaje')}
              />
            </div>

            <div className={styles.turnstile}>
              <Turnstile
                ref={turnstileRef}
                sitekey={TURNSTILE_SITE_KEY}
                onVerify={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken(null)}
                onError={() => setTurnstileToken(null)}
                theme="light"
              />
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={sending || !turnstileToken}
            >
              {sending ? 'Enviando...' : 'Enviar mensaje'}
            </button>

            {submitted && (
              <p className={styles.success}>
                ¡Mensaje enviado! Nos pondremos en contacto pronto.
              </p>
            )}

            {sendError && (
              <p className={styles.error} style={{ textAlign: 'center' }}>
                {sendError}
              </p>
            )}
          </form>

          <div className={styles.info}>
            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>Información de contacto</h3>

              <div className={styles.infoItem}>
                <FaMapMarkerAlt className={styles.infoIcon} />
                <span>General Belgrano, Buenos Aires, Argentina</span>
              </div>

              <div className={styles.infoItem}>
                <FaPhone className={styles.infoIcon} />
                <span>2243401378</span>
              </div>

              <h3 className={styles.socialTitle}>Seguinos en redes</h3>

              <div className={styles.socials}>
                <a
                  href="https://www.facebook.com/disenio.con.alas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label="Facebook"
                >
                  <FaFacebookF />
                </a>
                <a
                  href="https://wa.me/542243401378"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label="WhatsApp"
                >
                  <FaWhatsapp />
                </a>
                <a
                  href="https://www.instagram.com/disenio.con.alas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label="Instagram"
                >
                  <FaInstagram />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
