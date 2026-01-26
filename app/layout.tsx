import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { RaffleProvider } from "@/lib/context/RaffleContext";
import { ToastProvider } from "@/lib/context/ToastContext";
import { ToastContainer } from "@/components/ui/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lucky Draw - Online Lottery",
  description: "Win amazing prizes! Watch the prize pool grow in real-time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>
          <RaffleProvider>
            {children}
          </RaffleProvider>
          <ToastContainer />
        </ToastProvider>
      </body>
    </html>
  );
}
