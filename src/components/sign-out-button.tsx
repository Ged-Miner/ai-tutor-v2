'use client';

import { signOut } from 'next-auth/react';

export function SignOutButton() {
  const handleSignOut = async () => {
    await signOut({
      callbackUrl: '/auth/signin',
      redirect: true
    });
  };

  return (
<button
      onClick={handleSignOut}
      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition"
    >
      Sign Out
    </button>
  );
}
