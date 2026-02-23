import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FaTag, FaPrint, FaStore, FaChurch, FaGift, FaTshirt, FaStar } from 'react-icons/fa'
import type { IconType } from 'react-icons'
import styles from './ServiciosAdminPage.module.css'

const API_URL = import.meta.env.VITE_API_URL ?? ''

const iconMap: Record<string, IconType> = {
  FaTag, FaPrint, FaStore, FaChurch, FaGift, FaTshirt, FaStar,
}

const iconOptions = Object.keys(iconMap)

interface Service {
  id: string
  titulo: string
  descripcion: string
  icono: string
  orden: number
  activo: boolean
  created_at: string
  updated_at: string
}

const emptyForm = { titulo: '', descripcion: '', icono: 'FaStar', activo: true }

export default function ServiciosAdminPage() {
  const { token, logout } = useAuth()
  const navigate = useNavigate()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

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

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await authFetch(
        `${API_URL}/services/admin?sortField=orden&sortOrder=asc&limit=50`,
      )
      const json = await res.json()
      setServices(json.data ?? [])
    } catch (err) {
      if (err instanceof Error && err.message !== 'Sesión expirada') {
        setError('Error al cargar los servicios')
      }
    } finally {
      setLoading(false)
    }
  }, [authFetch])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  const openCreate = () => {
    setEditingId(null)
    setFormData(emptyForm)
    setShowForm(true)
  }

  const openEdit = (service: Service) => {
    setEditingId(service.id)
    setFormData({
      titulo: service.titulo,
      descripcion: service.descripcion,
      icono: service.icono,
      activo: service.activo,
    })
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData(emptyForm)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      if (editingId) {
        await authFetch(`${API_URL}/services/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(formData),
        })
      } else {
        await authFetch(`${API_URL}/services`, {
          method: 'POST',
          body: JSON.stringify(formData),
        })
      }
      closeForm()
      await fetchServices()
    } catch (err) {
      if (err instanceof Error && err.message !== 'Sesión expirada') {
        setError(editingId ? 'Error al actualizar el servicio' : 'Error al crear el servicio')
      }
    } finally {
      setSaving(false)
    }
  }

  const toggleActivo = async (service: Service) => {
    try {
      await authFetch(`${API_URL}/services/${service.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ activo: !service.activo }),
      })
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, activo: !s.activo } : s)),
      )
    } catch {
      setError('Error al actualizar el servicio')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await authFetch(`${API_URL}/services/${id}`, { method: 'DELETE' })
      setConfirmDeleteId(null)
      await fetchServices()
    } catch {
      setError('Error al eliminar el servicio')
    }
  }

  const moveService = async (index: number, direction: 'up' | 'down') => {
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= services.length) return

    const a = services[index]
    const b = services[swapIndex]

    try {
      await authFetch(`${API_URL}/services/reorder`, {
        method: 'PATCH',
        body: JSON.stringify([
          { id: a.id, orden: b.orden },
          { id: b.id, orden: a.orden },
        ]),
      })
      await fetchServices()
    } catch {
      setError('Error al reordenar los servicios')
    }
  }

  if (loading) {
    return <p className={styles.loading}>Cargando servicios...</p>
  }

  const Icon = ({ name }: { name: string }) => {
    const Comp = iconMap[name] ?? FaStar
    return <Comp />
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Servicios</h1>
        <button className={styles.createBtn} onClick={openCreate}>
          + Nuevo servicio
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {services.length === 0 ? (
        <p className={styles.empty}>No hay servicios cargados.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Orden</th>
                <th>Ícono</th>
                <th>Título</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service, index) => (
                <tr
                  key={service.id}
                  className={!service.activo ? styles.rowInactivo : ''}
                >
                  <td className={styles.cellOrden}>
                    <div className={styles.ordenControls}>
                      <button
                        className={styles.moveBtn}
                        disabled={index === 0}
                        onClick={() => moveService(index, 'up')}
                        title="Subir"
                      >
                        ▲
                      </button>
                      <span>{service.orden}</span>
                      <button
                        className={styles.moveBtn}
                        disabled={index === services.length - 1}
                        onClick={() => moveService(index, 'down')}
                        title="Bajar"
                      >
                        ▼
                      </button>
                    </div>
                  </td>
                  <td className={styles.cellIcon}>
                    <Icon name={service.icono} />
                  </td>
                  <td className={styles.cellTitulo}>{service.titulo}</td>
                  <td className={styles.cellDesc}>{service.descripcion}</td>
                  <td>
                    <span
                      className={`${styles.badge} ${service.activo ? styles.badgeActivo : styles.badgeInactivo}`}
                    >
                      {service.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.actionBtn}
                        onClick={() => openEdit(service)}
                      >
                        Editar
                      </button>
                      <button
                        className={`${styles.actionBtn} ${service.activo ? styles.actionBtnUndo : ''}`}
                        onClick={() => toggleActivo(service)}
                      >
                        {service.activo ? 'Desactivar' : 'Activar'}
                      </button>
                      {confirmDeleteId === service.id ? (
                        <>
                          <button
                            className={styles.actionBtnDanger}
                            onClick={() => handleDelete(service.id)}
                          >
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
                          onClick={() => setConfirmDeleteId(service.id)}
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
      )}

      {showForm && (
        <div className={styles.modalOverlay} onClick={closeForm}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>
              {editingId ? 'Editar servicio' : 'Nuevo servicio'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Título</label>
                <input
                  className={styles.formInput}
                  type="text"
                  maxLength={150}
                  required
                  value={formData.titulo}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, titulo: e.target.value }))
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Descripción</label>
                <textarea
                  className={styles.formTextarea}
                  maxLength={500}
                  required
                  rows={3}
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, descripcion: e.target.value }))
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Ícono</label>
                <div className={styles.iconSelector}>
                  {iconOptions.map((name) => {
                    const Ic = iconMap[name]
                    return (
                      <button
                        key={name}
                        type="button"
                        className={`${styles.iconOption} ${formData.icono === name ? styles.iconOptionActive : ''}`}
                        onClick={() => setFormData((f) => ({ ...f, icono: name }))}
                        title={name}
                      >
                        <Ic />
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formCheckLabel}>
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, activo: e.target.checked }))
                    }
                  />
                  Activo
                </label>
              </div>
              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={closeForm}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear servicio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
