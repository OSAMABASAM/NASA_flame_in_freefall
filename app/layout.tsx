import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { ScrollEffects } from "@/components/motion/ScrollEffects";
import "./globals.css";

// The system font comes first in --font-sans; Inter is the fallback, with metric-matched Arial so the swap does not
// move text.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap", adjustFontFallback: true });

export const metadata: Metadata = {
  metadataBase: new URL("https://flame-in-freefall-five.vercel.app"),
  title: "Flame in Freefall",
  description: "Which NASA microgravity fire experiments matter for a crew habitat, and why.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <MotionProvider>
          <ScrollEffects />
          {children}
        </MotionProvider>
      </body>
    </html>
  );
}
