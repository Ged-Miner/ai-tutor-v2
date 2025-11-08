import Link from "next/link";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          AI Tutor 2.0
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Your AI study partner and teaching assistant
        </p>
        {session ? (
          <Link
            href="/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition inline-block"
          >
            Go to Dashboard
          </Link>
        ) : (
          <Link
            href="/auth/signin"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition inline-block"
          >
            Sign In
          </Link>
        )}
      </div>
    </main>
  );
}
