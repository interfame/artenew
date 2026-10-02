import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  weight: "400",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ARTEDUR | Construcción en Seco, Durlock y Reformas – Buenos Aires",
  description:
    "Especialistas en construcción en seco, Durlock, cielorrasos, tabiques, pintura y reformas. Más de 25 años de experiencia en CABA y GBA. Presupuesto gratis.",
  keywords: [
    "Durlock",
    "Knauf",
    "construcción en seco",
    "cielorraso",
    "tabiques",
    "pintura",
    "reformas",
    "Buenos Aires",
  ],
  openGraph: {
    title: "ARTEDUR | Construcción en Seco y Reformas en Buenos Aires",
    description:
      "Especialistas en Durlock, cielorrasos, tabiques, pintura y reformas. Más de 25 años de experiencia en CABA y GBA.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${bebasNeue.variable} ${dmSans.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
