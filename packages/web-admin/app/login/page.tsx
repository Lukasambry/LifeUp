'use client';

import { signIn } from 'next-auth/react';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="flex flex-col items-center gap-6 rounded-2xl bg-white p-12 shadow-sm">
        <h1 className="text-2xl font-bold text-zinc-900">LifeUp Admin</h1>
        <button
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="flex items-center gap-3 rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition-colors"
        >
          Se connecter avec Google
        </button>
      </div>
    </div>
  );
}
