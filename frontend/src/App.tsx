import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
            <Route path="contactos" element={<ContactosPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
