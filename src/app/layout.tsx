import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ContactVault | Secure Personal CRM",
    template: "%s | ContactVault",
  },
  description: "Protect your network with industry-grade encryption. ContactVault is a secure personal CRM featuring Duress Protocols, Relationship Intelligence, and fail-safe data protection.",
  keywords: ["secure crm", "personal networking", "encryption", "privacy", "emergency contacts", "duress pin", "digital vault"],
  authors: [{ name: "ContactVault Team" }],
  icons: {
    icon: "/favicon.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "ContactVault | Secure Personal CRM",
    description: "Military-grade protection for your most valuable connections.",
    url: "https://contactvault.app",
    siteName: "ContactVault",
    images: [
      {
        url: "/logo.png",
        width: 1024,
        height: 1024,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
            <Toaster position="top-right" richColors closeButton />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
