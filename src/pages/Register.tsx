import AuthLayout from '../components/auth/AuthLayout'
import RegisterForm from '../components/auth/RegisterForm'

function Register() {
  return (
    <AuthLayout
      title="Criar Conta"
      subtitle="Junte-se à plataforma AIOX"
      image="https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&h=800&fit=crop"
    >
      <RegisterForm />
    </AuthLayout>
  )
}

export default Register
