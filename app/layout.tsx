import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project Team Directory",
  description: "Internal directory for project team member profiles",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
