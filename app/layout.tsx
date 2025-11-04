import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WorkTimer - Gestion du temps de travail",
  description: "Application de suivi du temps de travail par catégorie",
  manifest: "/manifest.json",
  themeColor: "#3b82f6",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WorkTimer",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
