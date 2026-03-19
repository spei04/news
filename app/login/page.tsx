import Link from "next/link";
import { Newspaper } from "lucide-react";
import { SignIn } from "@clerk/nextjs";

export default function LoginPage({ searchParams }: { searchParams: { email?: string } }) {
  const email = searchParams?.email ?? "";
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Newspaper className="h-10 w-10 text-blue-600" />
            <span className="text-3xl font-bold text-gray-900">NewsHub</span>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
          <p className="text-gray-600">Sign in to manage your subscriptions</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <SignIn
            fallbackRedirectUrl="/settings"
            signUpUrl="/register"
            initialValues={email ? { identifier: email } : undefined}
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-none border-0 p-0",
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
                footerActionLink: "text-blue-600 hover:text-blue-700"
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
