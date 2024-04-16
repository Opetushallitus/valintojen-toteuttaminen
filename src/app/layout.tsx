import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "./query-provider";
import { login } from "./lib/login-handler";
import { Suspense } from "react";
import { CircularProgress } from "@mui/material";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Valintojen Toteuttaminen",
  description: "Valintojen toteuttamisen käyttöliittymä",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await login();
  return (
    <html lang="fi">
      <body className={inter.className}>
        <Suspense fallback={<CircularProgress />}>
          <QueryProvider>{children}</QueryProvider>
        </Suspense>
      </body>
    </html>
  );
}
