import type { Metadata } from "next";
import "./globals.css";
import JungleBackground from "@/components/layout/JungleBackground";
import FloatingLeaves from "@/components/layout/FloatingLeaves";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "EcoNudge — Carbon Footprint Awareness Platform",
  description:
    "Understand, track, and reduce your carbon footprint through simple actions and personalized AI-powered insights.",
};

/** Root layout wrapping the entire application. */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-background font-quicksand min-h-screen flex flex-col antialiased relative">
        <JungleBackground />
        <FloatingLeaves />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
