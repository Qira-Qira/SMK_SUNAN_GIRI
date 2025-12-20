import LoginForm from '@/components/auth/LoginForm';
import Navbar from '@/components/common/Navbar';

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main className="container mx-auto py-12 px-4">
        <LoginForm />
      </main>
    </>
  );
}
