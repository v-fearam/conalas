import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <section style={{ padding: '8rem 1.5rem', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <title>Página no encontrada | Diseño con Alas</title>
      <meta name="robots" content="noindex" />
      <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>404</h1>
      <p style={{ fontSize: '1.25rem', marginBottom: '2rem', color: 'var(--color-slate-600)' }}>
        La página que buscás no existe.
      </p>
      <Link
        to="/"
        style={{
          background: 'var(--color-pink)',
          color: 'white',
          padding: '1rem 2rem',
          borderRadius: '99px',
          fontWeight: 600,
          fontSize: '1rem',
        }}
      >
        Volver al inicio
      </Link>
    </section>
  )
}
