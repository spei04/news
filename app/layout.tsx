import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/site/Header";
import { HeaderFallback } from "@/components/site/HeaderFallback";
import { Footer } from "@/components/site/Footer";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Daily AI + VC Digest",
  description: "A 10-minute daily read on AI/ML progress and startup/VC investing."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const hasClerk = Boolean(clerkPublishableKey);

  const shell = (
    <>
      {hasClerk ? <Header /> : <HeaderFallback />}
      {children}
      <Footer />
    </>
  );

  return (
    <html lang="en">
      <body className="min-h-dvh bg-gray-50">
        {hasClerk ? (
          <ClerkProvider publishableKey={clerkPublishableKey}>{shell}</ClerkProvider>
        ) : (
          shell
        )}
      </body>
    </html>
  );
}
