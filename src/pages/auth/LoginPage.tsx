import AuthLayout from '../../components/auth/AuthLayout'
import LoginForm from '../../components/auth/LoginForm'

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your account"
      image="https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=700&fit=crop"
    >
      <LoginForm />
    </AuthLayout>
  )
}
