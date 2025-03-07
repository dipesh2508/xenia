// "use client";

// import RootLayout from "@/app/layouts/RootLayout";
// import { usePathname } from "next/navigation";
// import "./globals.css";
// import "@repo/ui/globals.css";

// export default function Layout({ children }: { children: React.ReactNode }) {
//   const pathname = usePathname();

//   // If inside /dashboard, do NOT wrap with RootLayout
//   if (pathname.startsWith("/chatRoom")) {
//     return <>{children}</>;
//   }

//   // Otherwise, wrap with RootLayout
//   return <RootLayout>{children}</RootLayout>;
// }

import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";
import "@repo/ui/globals.css";

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
        </body>
      </AuthProvider>
    </html>
  );
}
