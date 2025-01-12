import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Müşteri Adayları | Admin Paneli",
  description: "Müşteri adayları yönetim sayfası",
};

export default function MusteriAdaylariLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
