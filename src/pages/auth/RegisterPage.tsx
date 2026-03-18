import AuthLayout from '../../components/auth/AuthLayout'
import RegisterForm from '../../components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join AIOX Platform"
      image="https://images.unsplash.com/photo-1557821552-17105176677c?w=500&h=700&fit=crop"
    >
      <RegisterForm />
    </AuthLayout>
  )
}
