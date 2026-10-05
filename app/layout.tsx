import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import "./persona3.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "Rizick FS | Persona 3 Reload Portfolio",
  description:
    "Pixel-perfect Persona 3 Reload Pause Menu portfolio built with Next.js, showcasing systems architecture, fullstack engineering, and pinned projects by Rizick FS.",
  icons: {
    icon: "/assets/favicon.png",
    shortcut: "/assets/favicon.png"
  },
  openGraph: {
    title: "Rizick FS | Persona 3 Reload Portfolio",
    description:
      "Fullstack developer specializing in Laravel, Flutter, and scalable web systems.",
    type: "website",
    url: "https://rizick-portfolio.vercel.app/"
  }
};

export const viewport: Viewport = {
  themeColor: "#001233",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.variable}>
      <head>
        <link
          rel="preload"
          href="/fonts/Rodin Pro EB.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
