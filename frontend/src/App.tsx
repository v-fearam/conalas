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
import LoginPage from './pages/admin/LoginPage'
import ContactosPage from './pages/admin/ContactosPage'
import ServiciosAdminPage from './pages/admin/ServiciosAdminPage'
import PortfolioAdminPage from './pages/admin/PortfolioAdminPage'
import './App.css'

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

          {/* Admin */}
          <Route path="/admin/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="contactos" replace />} />
            <Route path="contactos" element={<ContactosPage />} />
            <Route path="servicios" element={<ServiciosAdminPage />} />
            <Route path="portfolio" element={<PortfolioAdminPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
