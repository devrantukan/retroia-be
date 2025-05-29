"use client";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Input,
  Button,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import { useRouter, useSearchParams } from "next/navigation";
import { PencilIcon, TrashIcon } from "@heroicons/react/16/solid";
import { useState } from "react";
import { useDeleteContent } from "@/hooks/useDeleteContent";
import { toast } from "sonner";

interface Content {
  id: number;
  key: string;
  value: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ContentsTableProps {
  contents: Content[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
  searchTerm: string;
}

export default function ContentsTable({
  contents,
  totalPages,
  currentPage,
  totalCount,
  searchTerm,
}: ContentsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const { mutate: deleteContent, isLoading: isDeleting } = useDeleteContent();

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    params.set("pagenum", "1");
    router.push(`/admin/contents?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("pagenum", page.toString());
    router.push(`/admin/contents?${params.toString()}`);
  };

  const handleEdit = (content: Content) => {
    router.push(`/admin/contents/${content.id}/edit`);
  };

  const handleDelete = async () => {
    if (!selectedContent) return;

    try {
      await deleteContent(selectedContent.id, {
        onSuccess: () => {
          toast.success("İçerik başarıyla silindi");
          router.refresh();
        },
        onError: () => {
          toast.error("İçerik silinirken bir hata oluştu");
        },
      });
    } finally {
      onClose();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="İçerik ara..."
          value={searchTerm}
          onValueChange={handleSearch}
          className="w-64"
        />
      </div>

      <Table aria-label="İçerik tablosu">
        <TableHeader>
          <TableColumn>ANAHTAR</TableColumn>
          <TableColumn>DEĞER</TableColumn>
          <TableColumn>AÇIKLAMA</TableColumn>
          <TableColumn>SON GÜNCELLEME</TableColumn>
          <TableColumn>İŞLEMLER</TableColumn>
        </TableHeader>
        <TableBody
          items={contents}
          loadingContent={<div>Yükleniyor...</div>}
          emptyContent={<div>İçerik bulunamadı</div>}
        >
          {(content) => (
            <TableRow key={content.id}>
              <TableCell>{content.key}</TableCell>
              <TableCell>
                <div
                  className="max-w-md line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: content.value }}
                />
              </TableCell>
              <TableCell>{content.description}</TableCell>
              <TableCell>
                {new Date(content.updatedAt).toLocaleDateString("tr-TR")}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => handleEdit(content)}
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="danger"
                    onPress={() => {
                      setSelectedContent(content);
                      onOpen();
                    }}
                    isDisabled={isDeleting}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex justify-center">
        <Pagination
          total={totalPages}
          page={currentPage}
          onChange={handlePageChange}
        />
      </div>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>İçerik Sil</ModalHeader>
          <ModalBody>
            <p>
              <strong>{selectedContent?.key}</strong> anahtarlı içeriği silmek
              istediğinizden emin misiniz?
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              İptal
            </Button>
            <Button
              color="danger"
              onPress={handleDelete}
              isLoading={isDeleting}
            >
              Sil
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
