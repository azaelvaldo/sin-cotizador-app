import { LoginForm } from '@/components/login-form';

export default function Page() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: 'rgba(104, 77, 244, 0.3)' }}
    >
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
