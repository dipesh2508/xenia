"use client";

import RootLayout from "@/app/layouts/RootLayout";
import { usePathname } from "next/navigation";
import "./globals.css";
import "@repo/ui/globals.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // If inside /dashboard, do NOT wrap with RootLayout
  if (pathname.startsWith("/chatRoom")) {
    return <>{children}</>;
  }

  // Otherwise, wrap with RootLayout
  return <RootLayout>{children}</RootLayout>;
}
