import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold text-gray-900">
                AI Tutor 2.0
              </h1>
              <div className="flex gap-4">

                <a  href="/dashboard"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </a>
                {session.user.role === 'TEACHER' && (
                  <nav className="space-y-1">

                    <a href="/dashboard"
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                      Dashboard
                    </a>

                    <a href="/teacher/courses"
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                      My Courses
                    </a>
                  </nav>
                )}
                {session.user.role === "STUDENT" && (
                  <>

                     <a href="/dashboard/courses"
                      className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      My Courses
                    </a>

                    <a  href="/dashboard/chat"
                      className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Chat
                    </a>
                  </>
                )}
                {session.user.role === "ADMIN" && (
                  <>

                    <a  href="/dashboard/users"
                      className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Users
                    </a>

                    <a  href="/dashboard/prompts"
                      className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      System Prompts
                    </a>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm">
                <p className="font-medium text-gray-900">{session.user.name}</p>
                <p className="text-gray-500 text-xs">{session.user.role}</p>
              </div>
              <SignOutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
