import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Toast } from "../components/layout/Toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });


export const metadata = {
  title: "Western Intercontinental Bank",
  description: "A Global Banking Platform Worldwide.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${geistSans.variable} ${geistMono.variable}`}
      >
      <Toast />
        {children}
      </body>
    </html>
  );
}



