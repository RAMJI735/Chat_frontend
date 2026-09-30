import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "../components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://randomchatanyone.vercel.app"),

  title: "Random Chat Anyone - Talk to Strangers Online",

  description:
    "Random Chat Anyone is a free online random chat platform to meet new people, talk to strangers, and start real-time 1-on-1 conversations.",

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    title: "Random Chat Anyone - Talk to Strangers Online",
    description:
      "Meet new people and start random 1-on-1 conversations online.",
    url: "https://randomchatanyone.vercel.app/",
    siteName: "Random Chat Anyone",
    type: "website",
  },

  twitter: {
    card: "summary",
    title: "Random Chat Anyone - Talk to Strangers Online",
    description:
      "Meet new people and start random 1-on-1 conversations online.",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* 🌙 Dark mode: apply class before React hydrates to prevent flash */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var theme = localStorage.getItem('socketchat-theme');
                var isDark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
                if (isDark) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.setAttribute('data-theme', 'dark');
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              } catch(e) {}
            })();
          `
        }} />
      </head>
      <body 
        suppressHydrationWarning 
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}