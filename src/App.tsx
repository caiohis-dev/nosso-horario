import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AppLayout } from '@/components/AppLayout'
import { ROUTES } from '@/constants/routes'

// Lazy loading de todas as páginas
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'))
const ConfirmEmailPage = lazy(() => import('@/features/auth/pages/ConfirmEmailPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const EquipePage = lazy(() => import('@/features/equipe/pages/EquipePage'))
const DisciplinasPage = lazy(() => import('@/features/disciplinas/pages/DisciplinasPage'))
const SeriesPage = lazy(() => import('@/features/series/pages/SeriesPage'))
const EscolaDashboardPage = lazy(() => import('@/features/instituicao/pages/EscolaDashboardPage'))
const PerfilPage = lazy(() => import('@/pages/PerfilPage'))
const EquipeImportPage = lazy(() => import('@/features/equipe/pages/EquipeImportPage'))
const EscolasAdminPage = lazy(() => import('@/features/escolas/pages/EscolasAdminPage'))

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <div className="h-8 w-8 rounded-full border-4 border-border border-t-brand" />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Rotas públicas */}
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
          <Route path={ROUTES.CONFIRM_EMAIL} element={<ConfirmEmailPage />} />

          {/* Rotas protegidas */}
          <Route
            path={ROUTES.DASHBOARD}
            element={
              <ProtectedRoute>
                <AppLayout>
                  <DashboardPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.EQUIPE}
            element={
              <ProtectedRoute>
                <AppLayout>
                  <EquipePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.EQUIPE_LOTE}
            element={
              <ProtectedRoute>
                <AppLayout>
                  <EquipeImportPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.DISCIPLINAS}
            element={
              <ProtectedRoute>
                <AppLayout>
                  <DisciplinasPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.SERIES}
            element={
              <ProtectedRoute>
                <AppLayout>
                  <SeriesPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ESCOLAS_GERENCIAMENTO}
            element={
              <ProtectedRoute>
                <AppLayout>
                  <EscolasAdminPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/escola/:escolaId"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <EscolaDashboardPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <PerfilPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback: redireciona raiz para dashboard */}
          <Route
            path={ROUTES.HOME}
            element={
              <ProtectedRoute>
                <AppLayout>
                  <DashboardPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
