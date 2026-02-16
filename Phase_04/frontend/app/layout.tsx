import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BetterAuthProvider } from "./components/BetterAuthProvider";
import { TaskProvider } from "../context/TaskContext";
import Header from "./components/header"
import { getSessionData } from "../util/authentication-methods";

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
        className={`sm:h-screen grid grid-rows-[1fr_9fr] sm:overflow-hidden relative ${geistSans.variable} ${geistMono.variable} antialiased`}
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
