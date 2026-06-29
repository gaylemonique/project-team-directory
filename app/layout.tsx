import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { getInitialThemeScript } from "@/lib/theme";
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
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <script
          dangerouslySetInnerHTML={{ __html: getInitialThemeScript() }}
        />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
