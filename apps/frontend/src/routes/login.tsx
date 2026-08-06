import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { LoginForm } from '#/features/auth/components/login-form'
import { RegisterForm } from '#/features/auth/components/register-form'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

type AuthView = 'sign-in' | 'register'

function LoginPage() {
  const [currentView, setCurrentView] = useState<AuthView>('sign-in')
  const navigate = useNavigate()

  const handleSuccess = () => navigate({ to: '/' })

  return (
    <main className="demo-center px-4">
      <div className="demo-panel max-w-sm w-full flex flex-col items-center">
        {currentView === 'sign-in' ? (
          <>
            <h1 className="demo-section-title uppercase mb-2">Welcome back</h1>
            <p className="mb-6 text-center text-sm text-[var(--sea-ink-soft)]">
              Sign in to access an enhanced shopping experience.
            </p>
            <LoginForm onSuccess={handleSuccess} onError={(error) => alert(error)} />
            <span className="mt-6 text-center text-xs text-[var(--sea-ink-soft)]">
              Not a member?{' '}
              <button type="button" onClick={() => setCurrentView('register')} className="underline">
                Join us
              </button>
              .
            </span>
          </>
        ) : (
          <>
            <h1 className="demo-section-title uppercase mb-2">Become a member</h1>
            <p className="mb-6 text-center text-sm text-[var(--sea-ink-soft)]">
              Create your profile and get access to an enhanced shopping experience.
            </p>
            <RegisterForm onSuccess={handleSuccess} onError={(error) => alert(error)} />
            <span className="mt-6 text-center text-xs text-[var(--sea-ink-soft)]">
              Already a member?{' '}
              <button type="button" onClick={() => setCurrentView('sign-in')} className="underline">
                Sign in
              </button>
              .
            </span>
          </>
        )}
      </div>
    </main>
  )
}
