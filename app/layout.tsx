import type { Metadata, Viewport } from "next";
import { Geist, Geist_Pixel } from "next/font/google";
import { profile, site } from "@/content/site";
import BetaEgg from "@/components/BetaEgg";
import CommandMenu from "@/components/CommandMenu";
import ConsoleHello from "@/components/ConsoleHello";
import ShootingStar from "@/components/ShootingStar";
import Starfield from "@/components/Starfield";
import { WipeReveal } from "@/components/WipeLink";
import "./globals.css";

const sans = Geist({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
// Geist Pixel: Geist's own pixel cut, so it pairs with the body face as one family.
// Display sizes only (name, titles, big numbers); everything small is Geist.
const display = Geist_Pixel({ subsets: ["latin"], variable: "--font-display", display: "swap" });

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

const INTRO_SCRIPT = `try{var d=document.documentElement;if(location.pathname==="/"&&!sessionStorage.getItem("intro-seen")&&!location.hash&&!matchMedia("(prefers-reduced-motion: reduce)").matches){d.classList.add("intro");setTimeout(function(){if(d.classList.contains("intro")){d.classList.remove("intro");d.classList.add("intro-in")}},4000)}}catch(e){}`;

export const viewport: Viewport = {
  themeColor: "#090D24",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`} suppressHydrationWarning>
      <head>
        {/* First visit this session, homepage only: hide the hero copy before paint so the
            entrance can play. Skipped for reduced motion and deep links; a timer guarantees the copy shows. */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
      </head>
      <body>
        <Starfield />
        {children}
        <CommandMenu />
        <BetaEgg />
        <ShootingStar />
        <WipeReveal />
        <ConsoleHello />
      </body>
    </html>
  );
}
