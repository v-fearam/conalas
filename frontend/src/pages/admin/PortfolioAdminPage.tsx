import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from './PortfolioAdminPage.module.css'

const API_URL = import.meta.env.VITE_API_URL ?? ''
const PAGE_LIMIT = 10

interface PortfolioItem {
  id: string
  titulo: string
  descripcion: string | null
  foto_url: string | null
  fecha: string
  activo: boolean
  service_id: string
  services: { titulo: string } | null
  created_at: string
  updated_at: string
}

interface ServiceOption {
  id: string
  titulo: string
}

const emptyForm = {
  titulo: '',
  descripcion: '',
  service_id: '',
  fecha: new Date().toISOString().slice(0, 10),
  activo: true,
}

export default function PortfolioAdminPage() {
  const { token, logout } = useAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [total, setTotal] = useState(0)
  const [services, setServices] = useState<ServiceOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState(emptyForm)
  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [filterService, setFilterService] = useState('')
  const [filterActivo, setFilterActivo] = useState('')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>(null)

  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const res = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(options.headers ?? {}),
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

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({
        sortField: 'fecha',
        sortOrder: 'desc',
        limit: String(PAGE_LIMIT),
        page: String(page),
      })
      if (filterService) params.set('service_id', filterService)
      if (filterActivo) params.set('activo', filterActivo)
      if (search) params.set('search', search)
      const res = await authFetch(`${API_URL}/portfolio/admin?${params}`)
      const json = await res.json()
      setItems(json.data ?? [])
      setTotal(json.total ?? 0)
    } catch (err) {
      if (err instanceof Error && err.message !== 'Sesión expirada') {
        setError('Error al cargar el portfolio')
      }
    } finally {
      setLoading(false)
    }
  }, [authFetch, filterService, filterActivo, search, page])

  const fetchServices = useCallback(async () => {
    try {
      const res = await authFetch(`${API_URL}/services/admin?sortField=orden&sortOrder=asc&limit=50`)
      const json = await res.json()
      setServices((json.data ?? []).map((s: ServiceOption) => ({ id: s.id, titulo: s.titulo })))
    } catch {
      // Silently fail
    }
  }, [authFetch])

  useEffect(() => {
    fetchItems()
    fetchServices()
  }, [fetchItems, fetchServices])

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => {
      setSearch(value)
      setPage(1)
    }, 400)
  }

  const openCreate = () => {
    setEditingId(null)
    setFormData(emptyForm)
    setFotoFile(null)
    setFotoPreview(null)
    setShowForm(true)
  }

  const openEdit = (item: PortfolioItem) => {
    setEditingId(item.id)
    setFormData({
      titulo: item.titulo,
      descripcion: item.descripcion ?? '',
      service_id: item.service_id,
      fecha: item.fecha,
      activo: item.activo,
    })
    setFotoFile(null)
    setFotoPreview(item.foto_url)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData(emptyForm)
    setFotoFile(null)
    setFotoPreview(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFotoFile(file)
    setFotoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const body = new FormData()
      body.append('titulo', formData.titulo)
      body.append('descripcion', formData.descripcion)
      body.append('service_id', formData.service_id)
      body.append('fecha', formData.fecha)
      body.append('activo', String(formData.activo))
      if (fotoFile) body.append('foto', fotoFile)

      if (editingId) {
        await authFetch(`${API_URL}/portfolio/${editingId}`, { method: 'PATCH', body })
      } else {
        await authFetch(`${API_URL}/portfolio`, { method: 'POST', body })
      }
      closeForm()
      await fetchItems()
    } catch (err) {
      if (err instanceof Error && err.message !== 'Sesión expirada') {
        setError(editingId ? 'Error al actualizar' : 'Error al crear')
      }
    } finally {
      setSaving(false)
    }
  }

  const toggleActivo = async (item: PortfolioItem) => {
    try {
      const body = new FormData()
      body.append('activo', String(!item.activo))
      await authFetch(`${API_URL}/portfolio/${item.id}`, { method: 'PATCH', body })
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, activo: !i.activo } : i)),
      )
    } catch {
      setError('Error al actualizar')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await authFetch(`${API_URL}/portfolio/${id}`, { method: 'DELETE' })
      setConfirmDeleteId(null)
      await fetchItems()
    } catch {
      setError('Error al eliminar')
    }
  }

  const handleShare = async (item: PortfolioItem) => {
    const lines = [
      item.titulo,
      '',
      item.descripcion ?? '',
      '',
      `#${item.services?.titulo?.replace(/\s+/g, '') ?? 'DiseñoConAlas'} #DiseñoConAlas #DiseñoGráfico #GeneralBelgrano`,
    ].filter((l, i) => i === 1 || i === 3 || l)
    const text = lines.join('\n').trim()

    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }

    setCopiedId(item.id)
    setTimeout(() => setCopiedId(null), 4000)

    if (item.foto_url) {
      window.open(item.foto_url, '_blank')
    }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const totalPages = Math.ceil(total / PAGE_LIMIT)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Portfolio</h1>
          <span className={styles.count}>
            {total} publicaci{total !== 1 ? 'ones' : 'ón'}
          </span>
        </div>
        <button className={styles.createBtn} onClick={openCreate}>
          + Nueva publicación
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel} htmlFor="pf-search">Buscar</label>
          <input
            id="pf-search"
            type="text"
            className={styles.filterInput}
            placeholder="Buscar por título..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel} htmlFor="pf-filter-service">Servicio</label>
          <select
            id="pf-filter-service"
            className={styles.filterSelect}
            value={filterService}
            onChange={(e) => { setFilterService(e.target.value); setPage(1) }}
          >
            <option value="">Todos</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.titulo}</option>
            ))}
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel} htmlFor="pf-filter-estado">Estado</label>
          <select
            id="pf-filter-estado"
            className={styles.filterSelect}
            value={filterActivo}
            onChange={(e) => { setFilterActivo(e.target.value); setPage(1) }}
          >
            <option value="">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className={styles.loading}>Cargando portfolio...</p>
      ) : items.length === 0 ? (
        <p className={styles.empty}>
          {search || filterService || filterActivo
            ? 'No hay publicaciones que coincidan con la búsqueda.'
            : 'No hay publicaciones cargadas.'}
        </p>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Foto</th>
                  <th>Título</th>
                  <th>Categoría</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className={!item.activo ? styles.rowInactivo : ''}>
                    <td className={styles.cellFoto}>
                      {item.foto_url ? (
                        <img src={item.foto_url} alt={item.titulo} className={styles.thumbnail} />
                      ) : (
                        <div className={styles.thumbnailPlaceholder} />
                      )}
                    </td>
                    <td className={styles.cellTitulo}>{item.titulo}</td>
                    <td className={styles.cellCategoria}>{item.services?.titulo ?? '—'}</td>
                    <td className={styles.cellFecha}>{formatDate(item.fecha)}</td>
                    <td>
                      <span className={`${styles.badge} ${item.activo ? styles.badgeActivo : styles.badgeInactivo}`}>
                        {item.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.actionBtn} onClick={() => openEdit(item)}>
                          Editar
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.actionBtnShare} ${copiedId === item.id ? styles.actionBtnShareCopied : ''}`}
                          onClick={() => handleShare(item)}
                        >
                          {copiedId === item.id ? 'Texto copiado — guardá la imagen' : 'Compartir'}
                        </button>
                        <button
                          className={`${styles.actionBtn} ${item.activo ? styles.actionBtnUndo : ''}`}
                          onClick={() => toggleActivo(item)}
                        >
                          {item.activo ? 'Desactivar' : 'Activar'}
                        </button>
                        {confirmDeleteId === item.id ? (
                          <>
                            <button className={styles.actionBtnDanger} onClick={() => handleDelete(item.id)}>
                              Confirmar
                            </button>
                            <button
                              className={`${styles.actionBtn} ${styles.actionBtnUndo}`}
                              onClick={() => setConfirmDeleteId(null)}
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <button
                            className={styles.actionBtnDanger}
                            onClick={() => setConfirmDeleteId(item.id)}
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
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

      {showForm && (
        <div className={styles.modalOverlay} onClick={closeForm}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>
              {editingId ? 'Editar publicación' : 'Nueva publicación'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="pf-titulo">Título</label>
                <input
                  id="pf-titulo"
                  className={styles.formInput}
                  type="text"
                  maxLength={150}
                  required
                  value={formData.titulo}
                  onChange={(e) => setFormData((f) => ({ ...f, titulo: e.target.value }))}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="pf-desc">Descripción</label>
                <textarea
                  id="pf-desc"
                  className={styles.formTextarea}
                  maxLength={500}
                  rows={3}
                  value={formData.descripcion}
                  onChange={(e) => setFormData((f) => ({ ...f, descripcion: e.target.value }))}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="pf-service">Servicio (categoría)</label>
                <select
                  id="pf-service"
                  className={styles.formInput}
                  required
                  value={formData.service_id}
                  onChange={(e) => setFormData((f) => ({ ...f, service_id: e.target.value }))}
                >
                  <option value="">Seleccionar...</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.titulo}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="pf-fecha">Fecha</label>
                <input
                  id="pf-fecha"
                  className={styles.formInput}
                  type="date"
                  required
                  value={formData.fecha}
                  onChange={(e) => setFormData((f) => ({ ...f, fecha: e.target.value }))}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="pf-foto">Foto</label>
                <input
                  id="pf-foto"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className={styles.formFileInput}
                  onChange={handleFileChange}
                />
                {fotoPreview && (
                  <img src={fotoPreview} alt="Vista previa" className={styles.fotoPreview} />
                )}
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formCheckLabel}>
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={(e) => setFormData((f) => ({ ...f, activo: e.target.checked }))}
                  />
                  Activo
                </label>
              </div>
              <div className={styles.formActions}>
                <button type="button" className={styles.cancelBtn} onClick={closeForm}>
                  Cancelar
                </button>
                <button type="submit" className={styles.submitBtn} disabled={saving}>
                  {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear publicación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
