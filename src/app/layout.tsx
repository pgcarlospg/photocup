import type { Metadata } from "next";
import { Oswald, Barlow_Condensed, EB_Garamond } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "PhotoCup 2026 | Spark of Evolution",
  description: "Official Mensa International platform for PhotoCup 2026. Spark of Evolution — the essential impulse that drives beings, systems, or ideas to adapt, improve, or transform over time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${oswald.variable} ${barlowCondensed.variable} ${ebGaramond.variable} antialiased bg-[#080300]`}
        style={{ fontFamily: "var(--font-barlow), sans-serif" }}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
