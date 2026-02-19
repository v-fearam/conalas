import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from './ContactosPage.module.css'

const API_URL = import.meta.env.VITE_API_URL ?? ''

interface Contact {
  id: string
  nombre: string
  email: string
  telefono: string
  mensaje: string | null
  respondido: boolean
  respondido_at: string | null
  created_at: string
}

export default function ContactosPage() {
  const { token, logout } = useAuth()
  const navigate = useNavigate()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters and Pagination state
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [respondido, setRespondido] = useState<boolean | 'all'>(false) // Default: pending
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 6)
    return d.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState<string>('')
  const [sortField, setSortField] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const res = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      })
      if (res.status === 401) {
        logout()
        navigate('/admin/login', { replace: true })
        throw new Error('Sesión expirada')
      }
      return res
    },
    [token, logout, navigate],
  )

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortField,
        sortOrder,
      })

      if (respondido !== 'all') {
        params.append('respondido', respondido.toString())
      }
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const res = await authFetch(`${API_URL}/contact?${params.toString()}`)
      const data = await res.json()

      if (data && Array.isArray(data.data)) {
        setContacts(data.data)
        setTotal(data.total)
      } else {
        setContacts(Array.isArray(data) ? data : [])
        setTotal(Array.isArray(data) ? data.length : 0)
      }
    } catch (err) {
      if (err instanceof Error && err.message !== 'Sesión expirada') {
        setError('Error al cargar los contactos')
      }
    } finally {
      setLoading(false)
    }
  }, [authFetch, page, limit, respondido, startDate, endDate, sortField, sortOrder])

  const toggleRespondido = async (contact: Contact) => {
    try {
      await authFetch(`${API_URL}/contact/${contact.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ respondido: !contact.respondido }),
      })
      setContacts((prev) =>
        prev.map((c) =>
          c.id === contact.id
            ? {
              ...c,
              respondido: !c.respondido,
              respondido_at: !c.respondido ? new Date().toISOString() : null,
            }
            : c,
        ),
      )
    } catch {
      setError('Error al actualizar el contacto')
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return <p className={styles.loading}>Cargando contactos...</p>
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <span className={styles.sortIcon}>⇅</span>
    return (
      <span className={`${styles.sortIcon} ${styles.sortActive}`}>
        {sortOrder === 'asc' ? '▲' : '▼'}
      </span>
    )
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Contactos</h1>
        <span className={styles.count}>
          {total} mensaje{total !== 1 ? 's' : ''}
        </span>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Estado</label>
          <select
            className={styles.filterSelect}
            value={respondido.toString()}
            onChange={(e) => {
              const val = e.target.value
              setRespondido(val === 'all' ? 'all' : val === 'true')
              setPage(1)
            }}
          >
            <option value="false">Pendientes</option>
            <option value="true">Respondidos</option>
            <option value="all">Todos</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Desde</label>
          <input
            type="date"
            className={styles.filterInput}
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value)
              setPage(1)
            }}
          />
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Hasta</label>
          <input
            type="date"
            className={styles.filterInput}
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value)
              setPage(1)
            }}
          />
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {contacts.length === 0 ? (
        <p className={styles.empty}>No hay contactos que coincidan con la búsqueda.</p>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th
                    className={styles.thSortable}
                    onClick={() => handleSort('respondido')}
                  >
                    Estado <SortIcon field="respondido" />
                  </th>
                  <th
                    className={styles.thSortable}
                    onClick={() => handleSort('nombre')}
                  >
                    Nombre <SortIcon field="nombre" />
                  </th>
                  <th
                    className={styles.thSortable}
                    onClick={() => handleSort('email')}
                  >
                    Email <SortIcon field="email" />
                  </th>
                  <th>Teléfono</th>
                  <th>Mensaje</th>
                  <th
                    className={styles.thSortable}
                    onClick={() => handleSort('created_at')}
                  >
                    Fecha <SortIcon field="created_at" />
                  </th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className={contact.respondido ? styles.rowRespondido : ''}
                  >
                    <td>
                      <span
                        className={`${styles.badge} ${contact.respondido ? styles.badgeRespondido : styles.badgePendiente}`}
                      >
                        {contact.respondido ? 'Respondido' : 'Pendiente'}
                      </span>
                    </td>
                    <td className={styles.cellName}>{contact.nombre}</td>
                    <td>
                      <a href={`mailto:${contact.email}`}>{contact.email}</a>
                    </td>
                    <td>
                      <a href={`tel:${contact.telefono}`}>{contact.telefono}</a>
                    </td>
                    <td className={styles.cellMensaje} title={contact.mensaje || ''}>
                      {contact.mensaje || '—'}
                    </td>
                    <td className={styles.cellFecha}>
                      {formatDate(contact.created_at)}
                    </td>
                    <td>
                      <button
                        className={`${styles.actionBtn} ${contact.respondido ? styles.actionBtnUndo : ''}`}
                        onClick={() => toggleRespondido(contact)}
                      >
                        {contact.respondido
                          ? 'Marcar pendiente'
                          : 'Marcar respondido'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.paginationBtn}
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Anterior
              </button>
              <span className={styles.pageInfo}>
                Página {page} de {totalPages}
              </span>
              <button
                className={styles.paginationBtn}
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
