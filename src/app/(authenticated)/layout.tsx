import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Navigation } from '@/components/navigation';

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Redirect to signin if not authenticated
  if (!session?.user) {
    redirect('/auth/signin');
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation session={session} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto min-h-0">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
