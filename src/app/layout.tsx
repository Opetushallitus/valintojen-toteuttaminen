import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ReactQueryClientProvider from "./components/react-query-client-provider";
import Wrapper from "./wrapper";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import theme from "@/app/theme";

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
  return (
    <html lang="fi">
      <body className={inter.className}>
        <AppRouterCacheProvider>
          <ReactQueryClientProvider>
            <ThemeProvider theme={theme}>
              <Wrapper>{children}</Wrapper>
            </ThemeProvider>
          </ReactQueryClientProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
