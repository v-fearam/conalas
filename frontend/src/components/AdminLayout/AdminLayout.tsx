import { NavLink, Outlet, useNavigate } from 'react-router-dom'
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
        <div className={styles.brandNav}>
          <span className={styles.brand}>Diseño con Alas — Admin</span>
          <nav className={styles.nav}>
            <NavLink
              to="/admin/contactos"
              className={({ isActive }) => isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}
            >
              Contactos
            </NavLink>
            <NavLink
              to="/admin/servicios"
              className={({ isActive }) => isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}
            >
              Servicios
            </NavLink>
          </nav>
        </div>
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
