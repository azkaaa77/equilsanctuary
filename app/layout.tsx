import type { Metadata } from "next";
import { Geist, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { ClientProviders } from "@/components/providers/client-providers";
import "./globals.css";
import { Preloader } from "@/components/home/Preloader";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  weight: ["400", "700", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "EQUIL // The Equilibrium Engine",
  description:
    "A dedicated life-management sanctuary for Gen Z. Re-architecting balance in finance, career, and soul.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${jetbrainsMono.variable} ${plusJakartaSans.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning className="antialiased">
        <Preloader />
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
