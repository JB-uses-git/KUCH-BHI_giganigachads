import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI-PROOF | Detect AI-Generated Images",
  description: "Detect AI-generated images using StegaStamp invisible watermarks",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
