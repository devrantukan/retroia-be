"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Pagination,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  deleteContactForm,
  updateContactForm,
} from "@/lib/actions/contact-form";
import { toast } from "sonner";

export default function ContactFormsTable({
  contactForms,
  currentPage,
  totalPages,
}: {
  contactForms: any[];
  currentPage: number;
  totalPages: number;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleStatusChange = async (
    id: string,
    status: "PENDING" | "PROCESSED" | "REJECTED"
  ) => {
    try {
      await updateContactForm(id, { status });
      toast.success("Durum güncellendi");
    } catch (error) {
      toast.error("Bir hata oluştu");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bu formu silmek istediğinizden emin misiniz?")) {
      setIsDeleting(true);
      try {
        await deleteContactForm(id);
        toast.success("Form silindi");
      } catch (error) {
        toast.error("Bir hata oluştu");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Table
      aria-label="Contact forms table"
      bottomContent={
        <div className="flex w-full justify-center">
          <Pagination
            isCompact
            showControls
            showShadow
            color="primary"
            page={currentPage}
            total={totalPages}
            onChange={(page) =>
              router.push(`/admin/contact-forms?pagenum=${page}`)
            }
          />
        </div>
      }
    >
      <TableHeader>
        <TableColumn>İsim</TableColumn>
        <TableColumn>Telefon</TableColumn>
        <TableColumn>Mesaj</TableColumn>
        <TableColumn>Durum</TableColumn>
        <TableColumn>Tarih</TableColumn>
        <TableColumn>İşlemler</TableColumn>
      </TableHeader>
      <TableBody>
        {contactForms.map((form) => (
          <TableRow key={form.id}>
            <TableCell>{`${form.firstName} ${form.lastName}`}</TableCell>
            <TableCell>{form.phone}</TableCell>
            <TableCell>{form.message}</TableCell>
            <TableCell>
              <Dropdown>
                <DropdownTrigger>
                  <Button variant="bordered" size="sm">
                    {form.status}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Status actions"
                  onAction={(key) =>
                    handleStatusChange(
                      form.id,
                      key.toString() as "PENDING" | "PROCESSED" | "REJECTED"
                    )
                  }
                >
                  <DropdownItem key="PENDING">Bekliyor</DropdownItem>
                  <DropdownItem key="PROCESSED">İşlendi</DropdownItem>
                  <DropdownItem key="REJECTED">Reddedildi</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </TableCell>
            <TableCell>
              {new Date(form.createdAt).toLocaleDateString("tr-TR")}
            </TableCell>
            <TableCell>
              <Button
                color="danger"
                size="sm"
                isLoading={isDeleting}
                onPress={() => handleDelete(form.id)}
              >
                Sil
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
