import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { experiment, profile, site } from "@/content/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
  openGraph: {
    type: "website",
    url: "/",
    title: site.title,
    description: site.description,
    siteName: profile.name,
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

// Picks (or recalls) this visitor's A/B variant before first paint, so the button never flickers.
const assignVariant = `(function(){var k="ab:${experiment.id}",v;try{v=localStorage.getItem(k)}catch(e){}if(v!=="A"&&v!=="B"){v=Math.random()<0.5?"A":"B";try{localStorage.setItem(k,v)}catch(e){}}document.documentElement.setAttribute("data-ab",v)})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: assignVariant }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
