import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Carspotting",
  description: "Hitta bilar med regnummer i rätt ordning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
