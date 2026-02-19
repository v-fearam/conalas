import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from './LoginPage.module.css'

interface LoginForm {
  email: string
  password: string
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    setError(null)
    try {
      await login(data.email, data.password)
      navigate('/admin/contactos', { replace: true })
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al iniciar sesión'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.wrapper}>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <h1 className={styles.title}>Admin</h1>
        <p className={styles.subtitle}>Ingresá con tu cuenta de administrador</p>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>
            Email
          </label>
          <input
            id="email"
            type="email"
            className={styles.input}
            placeholder="tu@email.com"
            autoComplete="email"
            {...register('email', {
              required: 'El email es obligatorio',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Email inválido',
              },
            })}
          />
          {errors.email && (
            <p className={styles.fieldError}>{errors.email.message}</p>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="password" className={styles.label}>
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            className={styles.input}
            placeholder="••••••••"
            autoComplete="current-password"
            {...register('password', {
              required: 'La contraseña es obligatoria',
            })}
          />
          {errors.password && (
            <p className={styles.fieldError}>{errors.password.message}</p>
          )}
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  )
}
