import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Danışman Adayları | Admin Paneli",
  description: "Danışman adayları yönetim sayfası",
};

export default function DanismanAdaylariLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
