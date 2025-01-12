import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Danışman Değerlendirmeleri | Admin Paneli",
  description: "Danışman değerlendirmeleri yönetim sayfası",
};

export default function DanismanDegerlendirmeleriLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
