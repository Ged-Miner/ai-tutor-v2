import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface AuthErrorPageProps {
  searchParams: Promise<{ error?: string }>;
}

function getErrorMessage(error: string | null | undefined): string {
  switch (error) {
    case 'Configuration':
      return 'There is a problem with the server configuration.';
    case 'AccessDenied':
      return 'Access denied. You do not have permission to sign in.';
    case 'Verification':
      return 'The verification token has expired or has already been used.';
    case 'OAuthSignin':
      return 'Error in constructing an authorization URL.';
    case 'OAuthCallback':
      return 'Error in handling the response from the OAuth provider.';
    case 'OAuthCreateAccount':
      return 'Could not create OAuth provider user in the database.';
    case 'EmailCreateAccount':
      return 'Could not create email provider user in the database.';
    case 'Callback':
      return 'Error in the OAuth callback handler route.';
    case 'OAuthAccountNotLinked':
      return 'Email already exists with a different provider.';
    case 'SessionRequired':
      return 'Please sign in to access this page.';
    case 'Default':
    default:
      return 'An error occurred during authentication.';
  }
}

export default async function AuthErrorPage({
  searchParams,
}: AuthErrorPageProps) {
  const params = await searchParams;
  const error = params.error || null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Authentication Error
          </h1>

          <p className="text-gray-600 mb-6">
            {getErrorMessage(error)}
          </p>

          <div className="space-y-3">
            <Link
              href="/auth/signin"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              Try Again
            </Link>

            <Link
              href="/"
              className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition"
            >
              Go Home
            </Link>
          </div>

          {error && (
            <p className="mt-6 text-xs text-gray-500">
              Error code: {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
