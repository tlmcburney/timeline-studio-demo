import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Timeline Studio",
  description: "Wedding timeline generator by Sample Events Studio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
