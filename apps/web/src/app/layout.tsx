import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";
import "@repo/ui/globals.css";
import { Toaster } from "sonner";

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
          {children}
          <Toaster richColors />
        </body>
      </AuthProvider>
    </html>
  );
}
