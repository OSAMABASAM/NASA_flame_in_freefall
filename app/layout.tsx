import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { ScrollEffects } from "@/components/motion/ScrollEffects";
import "./globals.css";

// System font first (San Francisco on Apple devices); Inter is the web fallback elsewhere. While Inter loads, text
// shows in "Inter Fallback" (Arial resized to Inter's metrics), so the swap does not move the text.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap", adjustFontFallback: true });

export const metadata: Metadata = {
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
