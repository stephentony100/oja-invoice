import type { Metadata } from "next";
import { Space_Grotesk, Plus_Jakarta_Sans, Space_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://oja-invoice.vercel.app";
const TAGLINE = "Type it. Send it. Get paid.";
const DESCRIPTION =
  "Write an order the way you already text your customers. Nado turns it into a proper invoice, a Monnify payment link, and a receipt, with your sales tracked as you go.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `Nado — ${TAGLINE}`,
    template: "%s · Nado",
  },
  description: DESCRIPTION,
  keywords: [
    "invoicing",
    "WhatsApp business",
    "payment links",
    "Monnify",
    "Nigerian small business",
    "chat to invoice",
  ],
  openGraph: {
    title: `Nado — ${TAGLINE}`,
    description: DESCRIPTION,
    url: APP_URL,
    siteName: "Nado",
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Nado — ${TAGLINE}`,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${plusJakarta.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-bg font-body text-text">
        {children}
      </body>
    </html>
  );
}
