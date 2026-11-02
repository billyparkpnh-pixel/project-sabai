import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "Project Sa’Bai · One Goal, One Heart",
    template: "%s | Project Sa’Bai",
  },
  description:
    "A proposed Project Sa’Bai community healthcare website. Connecting care, learning and community in Cambodia.",
  robots: { index: false, follow: false },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
