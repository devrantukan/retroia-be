"use client";

import { Button } from "@nextui-org/react";
import { PencilIcon, TrashIcon } from "@heroicons/react/16/solid";
import { useRouter } from "next/navigation";
import { useDeleteContent } from "@/hooks/useDeleteContent";
import { toast } from "react-toastify";

interface Content {
  id: number;
  key: string;
  value: string;
  description?: string;
  updatedAt: string;
}

function ContentActions({ item }: { item: Content }) {
  const router = useRouter();
  const { mutate: deleteContent } = useDeleteContent();

  const handleDelete = () => {
    if (window.confirm("Bu içeriği silmek istediğinizden emin misiniz?")) {
      deleteContent(item.id, {
        onSuccess: () => {
          toast.success("İçerik başarıyla silindi");
        },
        onError: () => {
          toast.error("İçerik silinirken bir hata oluştu");
        },
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        isIconOnly
        size="sm"
        variant="light"
        onClick={() => router.push(`/admin/contents/${item.id}/edit`)}
      >
        <PencilIcon className="w-4 h-4" />
      </Button>
      <Button
        isIconOnly
        size="sm"
        color="danger"
        variant="light"
        onClick={handleDelete}
      >
        <TrashIcon className="w-4 h-4" />
      </Button>
    </div>
  );
}

export const columns = [
  {
    key: "key",
    label: "Anahtar",
  },
  {
    key: "description",
    label: "Açıklama",
  },
  {
    key: "updatedAt",
    label: "Son Güncelleme",
    render: (item: Content) => {
      const date = new Date(item.updatedAt);
      return date.toLocaleDateString("tr-TR");
    },
  },
  {
    key: "actions",
    label: "İşlemler",
    render: (item: Content) => <ContentActions item={item} />,
  },
];
