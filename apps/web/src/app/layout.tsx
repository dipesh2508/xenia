import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import "@repo/ui/globals.css";
import Navbar from "../components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { AuthProvider } from "@/context/AuthContext";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Xenia",
  description: "Connect & Create with Friends Online",
  keywords: [
    "Xenia",
    "Chat",
    "whiteboard",
    "Friends",
    "Canvas",
    "Draw",
    "Hangout",
    "Community",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <AuthProvider>
        <body
          className={`${montserrat.className} bg-background text-foreground overflow-visible`}
        >
          <Navbar />
          {children}
          <Footer />
        </body>
      </AuthProvider>
    </html>
  );
}
