import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["900"], // Main requirement is Black (900)
});

export const metadata: Metadata = {
  title: "Street Barber Shop RIFAS",
  description: "Plataforma premium de rifas da Street Barber Shop",
};

import Header from "@/components/Header";

export const viewport = {
  themeColor: "#0A0A0A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${montserrat.variable} font-sans antialiased selection:bg-brand/30 min-h-screen bg-background text-foreground`}>
        <Header />
        <div className="pt-20">
          {children}
        </div>
      </body>
    </html>
  );
}
