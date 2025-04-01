import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { RegisterSW } from "./register-sw";
import { LoadingScreen } from "@/components/loading-screen";
import { Toaster } from "@/components/ui/toaster";

export const metadata = {
  title: "יגאל & טלי",
  description: "תכנון ערבי דייט שבועיים",
  manifest: "/manifest.json",
  generator: "v0.dev",
  icons: {
    icon: "/icons/logoyigalandtali.png",
    apple: "/icons/logoyigalandtali.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "יגאל & טלי",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: "#ffffff",
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link
          rel="apple-touch-icon"
          sizes="512x512"
          href="/icons/logoyigalandtali.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="512x512"
          href="/icons/logoyigalandtali.png"
        />
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="יגאל & טלי" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <LoadingScreen />
          {children}
          <RegisterSW />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

import "./globals.css";
