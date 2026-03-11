import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Street Barber Shop RIFAS",
  description: "Plataforma premium de rifas da Street Barber Shop",
};

export const viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} antialiased selection:bg-primary/30 min-h-screen bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}
