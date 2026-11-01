import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flame in Freefall",
  description: "Which NASA microgravity fire experiments matter for a crew habitat, and why.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
