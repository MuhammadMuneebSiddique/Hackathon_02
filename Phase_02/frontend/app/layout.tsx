import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BetterAuthProvider } from "@/app/components/BetterAuthProvider";
import { TaskProvider } from "@/context/TaskContext";
import Header from "@/app/components/header"
import { getSessionData } from "@/util/authentication-methods";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Multi-User TODO Application",
  description: "A secure TODO application with Better Auth",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const session = await getSessionData()

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <BetterAuthProvider>
          <TaskProvider>
            <Header />
            {children}
          </TaskProvider>
        </BetterAuthProvider>
      </body>
    </html>
  );
}
