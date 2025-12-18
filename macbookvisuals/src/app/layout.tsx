import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import Link from "next/link";

export const metadata: Metadata = {
  title: "MacbookVisuals Dashboard",
  description: "Local dashboard for managing TikTok videos and captions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />

        <div className="page-container">{children}</div>

        <footer className="legal-footer">
          <Link href="/privacy-policy">Privacy Policy</Link>
          <span>•</span>
          <Link href="/terms-of-service">Terms of Service</Link>
        </footer>
      </body>
    </html>
  );
}
