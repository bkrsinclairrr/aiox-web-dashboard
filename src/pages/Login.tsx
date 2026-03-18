import AuthLayout from '../components/auth/AuthLayout'
import LoginForm from '../components/auth/LoginForm'

function Login() {
  return (
    <AuthLayout
      title="AIOX Dashboard"
      subtitle="Controle seus agentes IA com inteligência"
      image="https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=800&fit=crop"
    >
      <LoginForm />
    </AuthLayout>
  )
}

export default Login
