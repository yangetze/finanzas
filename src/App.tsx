import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/hooks/useAuth'
import { ToastProvider } from '@/components/ui/Toast'
import { RequireAuth } from '@/components/layout/RequireAuth'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { AuthCallbackPage } from '@/pages/AuthCallbackPage'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { EnvelopesPage } from '@/pages/EnvelopesPage'
import { TransactionsPage } from '@/pages/TransactionsPage'
import { BudgetPage } from '@/pages/BudgetPage'
import { DebtsPage } from '@/pages/DebtsPage'
import { BabyStepsPage } from '@/pages/BabyStepsPage'
import { ExchangeRatesPage } from '@/pages/ExchangeRatesPage'
import { WalletsPage } from '@/pages/WalletsPage'
import { SettingsPage } from '@/pages/SettingsPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            {/* Onboarding — requires session but NOT onboarding done */}
            <Route path="/onboarding" element={<OnboardingPage />} />

            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Protected routes inside AppShell */}
            <Route
              element={
                <RequireAuth>
                  <AppShell />
                </RequireAuth>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/billeteras" element={<WalletsPage />} />
              <Route path="/sobres" element={<EnvelopesPage />} />
              <Route path="/gastos" element={<TransactionsPage />} />
              <Route path="/presupuesto" element={<BudgetPage />} />
              <Route path="/deudas" element={<DebtsPage />} />
              <Route path="/metas" element={<BabyStepsPage />} />
              <Route path="/tasas" element={<ExchangeRatesPage />} />
              <Route path="/configuracion" element={<SettingsPage />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
