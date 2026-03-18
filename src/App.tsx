import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'

// Layouts
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { SettingsLayout } from '@/layouts/SettingsLayout'

// Auth callback
import { AuthCallback } from '@/pages/AuthCallback'

// Public pages
import { Landing } from '@/pages/Landing'
import { SignUp } from '@/pages/SignUp'
import { Login } from '@/pages/Login'
import { ForgotPassword } from '@/pages/ForgotPassword'
import { ResetPassword } from '@/pages/ResetPassword'
import { Pricing } from '@/pages/Pricing'
import { Privacy } from '@/pages/Privacy'
import { Terms } from '@/pages/Terms'

// Onboarding
import { Onboarding } from '@/pages/Onboarding'
import { Tutorial } from '@/pages/Tutorial'
import { EmailVerified } from '@/pages/EmailVerified'

// Authenticated pages
import { DashboardNew as Dashboard } from '@/pages/DashboardNew'
import { NewScan } from '@/pages/NewScan'
import { Reports } from '@/pages/Reports'
import { AuditDetail } from '@/pages/AuditDetail'

// Settings pages
import { Account } from '@/pages/settings/Account'
import { Security } from '@/pages/settings/Security'
import { Notifications } from '@/pages/settings/Notifications'
import { PlansAndCredits } from '@/pages/settings/PlansAndCredits'
import { PaymentHistory } from '@/pages/settings/PaymentHistory'
import { CreditHistory } from '@/pages/settings/CreditHistory'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  if (!user) return <Navigate to="/" replace />
  return <>{children}</>
}

function OnboardingRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  if (user) {
    const onboardingDone = localStorage.getItem('onboarding_complete')
    return <Navigate to={onboardingDone ? '/dashboard' : '/onboarding'} replace />
  }
  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<PublicOnlyRoute><Landing /></PublicOnlyRoute>} />
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/signup" element={<PublicOnlyRoute><SignUp /></PublicOnlyRoute>} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

          {/* Email verified (public, auto-redirects) */}
          <Route path="/email-verified" element={<EmailVerified />} />

          {/* Onboarding (requires auth, no sidebar) */}
          <Route path="/onboarding" element={<OnboardingRoute><Onboarding /></OnboardingRoute>} />
          <Route path="/tutorial" element={<OnboardingRoute><Tutorial /></OnboardingRoute>} />

          {/* Protected — all share DashboardLayout */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/scan" element={<NewScan />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/audits/:id" element={<AuditDetail />} />

            {/* Settings — nested under SettingsLayout */}
            <Route path="/settings" element={<SettingsLayout />}>
              <Route index element={<Navigate to="/settings/account" replace />} />
              <Route path="account" element={<Account />} />
              <Route path="security" element={<Security />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="plans" element={<PlansAndCredits />} />
              <Route path="payments" element={<PaymentHistory />} />
              <Route path="credits" element={<CreditHistory />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
