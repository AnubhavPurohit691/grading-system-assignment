import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { AppNavWrapper } from "@/components/app-nav-wrapper";
import { AppFooter } from "@/components/app-footer";
import { MainContentSpacer } from "@/components/main-content-spacer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Grading.AI", template: "%s — Grading.AI" },
  description: "Create and manage question papers. AI grading and report cards.",
  openGraph: { title: "Grading.AI", description: "Create and manage question papers. AI grading and report cards." },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#fff" }, { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AppNavWrapper />
          <main className="relative flex min-h-screen flex-col">
            <MainContentSpacer>{children}</MainContentSpacer>
          </main>
          <Toaster richColors position="top-center" theme="light" />
        </ThemeProvider>
      </body>
    </html>
  );
}
