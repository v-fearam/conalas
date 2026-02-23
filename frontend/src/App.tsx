import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ScrollToTop from './components/ScrollToTop'
import PublicLayout from './components/PublicLayout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './components/AdminLayout/AdminLayout'
import HomePage from './pages/HomePage'
import ServiciosPage from './pages/ServiciosPage'
import PortfolioPage from './pages/PortfolioPage'
import NosotrosPage from './pages/NosotrosPage'
import ContactoPage from './pages/ContactoPage'
import NotFoundPage from './pages/NotFoundPage'
import './App.css'

const LoginPage = lazy(() => import('./pages/admin/LoginPage'))
const ContactosPage = lazy(() => import('./pages/admin/ContactosPage'))
const ServiciosAdminPage = lazy(() => import('./pages/admin/ServiciosAdminPage'))
const PortfolioAdminPage = lazy(() => import('./pages/admin/PortfolioAdminPage'))

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <Routes>
          {/* Rutas públicas con Header + Footer */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/servicios" element={<ServiciosPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/nosotros" element={<NosotrosPage />} />
            <Route path="/contacto" element={<ContactoPage />} />
          </Route>

          {/* Admin (lazy-loaded) */}
          <Route path="/admin/login" element={<Suspense><LoginPage /></Suspense>} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="contactos" replace />} />
            <Route path="contactos" element={<Suspense><ContactosPage /></Suspense>} />
            <Route path="servicios" element={<Suspense><ServiciosAdminPage /></Suspense>} />
            <Route path="portfolio" element={<Suspense><PortfolioAdminPage /></Suspense>} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
