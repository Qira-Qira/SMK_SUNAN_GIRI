import LoginForm from '@/components/auth/LoginForm';
import Navbar from '@/components/common/Navbar';
import GeometricBackground from '@/components/common/GeometricBackground';

export default function LoginPage() {
  return (
    <div className="min-h-screen relative">
      <GeometricBackground />
      <Navbar />
      <main className="container mx-auto py-12 px-4 relative z-10">
        <LoginForm />
      </main>
    </div>
  );
}
