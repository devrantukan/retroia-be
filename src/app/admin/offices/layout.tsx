import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ofisler | Admin Paneli",
  description: "Ofis yönetim sayfası",
};

export default function OfislerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
