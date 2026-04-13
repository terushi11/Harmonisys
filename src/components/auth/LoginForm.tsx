'use client';

import { useState, useTransition } from 'react';
import { Button } from '@heroui/react';
import { Mail, Lock } from 'lucide-react';
import AuthFloatingInput from './AuthFloatingInput';
import { handleCredentialsLogin, handleGoogleLogin } from '@/lib/action/user';

interface LoginFormProps {
  onSwitchToRegister?: () => void;
  onSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSwitchToRegister,
  onSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const result = await handleCredentialsLogin(email, password);

      if (!result?.success) {
        setErrorMessage(result?.message || 'Login failed.');
        return;
      }

      onSuccess?.();
      window.location.reload();
    });
  };

  return (
    <div className="w-full">
      <form onSubmit={onSubmit} className="space-y-5">
        <AuthFloatingInput
            type="email"
            label="Enter email"
            value={email}
            onChange={setEmail}
            icon={<Mail className="w-5 h-5" />}
            required
            autoComplete="email"
        />

        <AuthFloatingInput
            type="password"
            label="Enter password"
            value={password}
            onChange={setPassword}
            icon={<Lock className="w-5 h-5" />}
            required
            autoComplete="current-password"
        />

        <div className="flex justify-end pt-1">
          <button
            type="button"
            className="text-sm font-medium text-yellow-300 hover:text-yellow-200"
          >
            Forgot Password?
          </button>
        </div>

        {errorMessage && (
          <div className="rounded-xl border border-red-300/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {errorMessage}
          </div>
        )}

        <Button
          type="submit"
          isLoading={isPending}
          className="w-full h-14 rounded-2xl bg-yellow-400 text-black font-bold text-[18px] hover:bg-yellow-300"
        >
          Login
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/15" />
        <span className="text-white/55 text-sm font-medium">or</span>
        <div className="h-px flex-1 bg-white/15" />
      </div>

      <form action={handleGoogleLogin}>
        <Button
          type="submit"
          className="w-full h-14 rounded-2xl bg-white text-gray-800 font-semibold hover:bg-gray-100"
        >
          Continue with Google
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-white/80">
        Don&apos;t have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="font-medium text-white underline underline-offset-4 hover:text-yellow-200"
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default LoginForm;