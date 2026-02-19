import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from './AdminLayout.module.css'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className={styles.layout}>
      <header className={styles.topbar}>
        <span className={styles.brand}>Diseño con Alas — Admin</span>
        <div className={styles.userSection}>
          <span className={styles.userName}>{user?.nombre ?? user?.email}</span>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Cerrar sesión
          </button>
        </div>
      </header>
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  )
}
