import type { Metadata } from "next";
import "./globals.css";
import Header from '@/components/Header'


export const metadata: Metadata = {
  title: "Pokedex"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
      >
        <Header/>
        {children}
      </body>
    </html>
  );
}
