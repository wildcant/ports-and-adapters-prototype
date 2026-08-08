import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@proteus/ui'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { LoginForm } from '#/features/auth/components/login-form'

export const Route = createFileRoute('/_public/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()

  return (
    <div className="w-full max-w-sm px-4">
      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Enter your credentials to access the admin dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm onSuccess={() => navigate({ to: '/' })} />
        </CardContent>
      </Card>
    </div>
  )
}
