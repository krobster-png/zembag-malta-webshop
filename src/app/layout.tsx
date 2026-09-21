import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zembag Malta | Smart storage for your harvest",
  description: "Reusable storage bags for potatoes, garlic and vegetables.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
