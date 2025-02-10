"use client";
import { TrashIcon } from "@heroicons/react/16/solid";
import { EyeIcon, PencilIcon } from "@heroicons/react/16/solid";
import {
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
  Switch,
} from "@nextui-org/react";
import { Prisma, Property } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updatePublishingStatus } from "@/app/actions/updatePropertyStatus";
import { toast } from "react-toastify";

type Props = {
  properties: Prisma.PropertyGetPayload<{
    include: {
      status: true;
      images: true;
      type: true;
    };
  }>[];
  totalPages: number;
  currentPage: number;
};

const PropertiesTable = ({ properties, totalPages, currentPage }: Props) => {
  // console.log("currentPage is:", currentPage - 1);
  const router = useRouter();

  const handlePublishChange = async (
    propertyId: number,
    isPublished: boolean
  ) => {
    try {
      console.log(
        "Updating status for property:",
        propertyId,
        "to:",
        isPublished ? "PUBLISHED" : "PENDING"
      );

      const result = await updatePublishingStatus(
        propertyId.toString(),
        isPublished ? "PUBLISHED" : "PENDING"
      );

      if (!result) {
        throw new Error("Failed to update status");
      }

      // Revalidate the property page after status change
      try {
        const response = await fetch(process.env.NEXT_PUBLIC_REVALIDATE_URL!, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: `/property/${propertyId.toString()}`,
            token: process.env.NEXT_PUBLIC_REVALIDATE_TOKEN,
          }),
        });

        if (!response.ok) {
          console.error("Revalidation failed:", await response.text());
          throw new Error("Revalidation failed");
        }

        const revalidateHome = await fetch(
          process.env.NEXT_PUBLIC_REVALIDATE_URL!,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              path: `/`,
              token: process.env.NEXT_PUBLIC_REVALIDATE_TOKEN,
            }),
          }
        );

        if (!revalidateHome.ok) {
          console.error(
            "Home revalidation failed:",
            await revalidateHome.text()
          );
          throw new Error("Home revalidation failed");
        }
      } catch (revalidateError) {
        console.error("Revalidation error:", revalidateError);
        // Don't throw here, just log the error
      }

      toast.success(
        isPublished ? "İlan yayınlandı!" : "İlan yayından kaldırıldı!"
      );
      router.refresh();
    } catch (error) {
      console.error("Error updating property status:", error);
      toast.error("Bir hata oluştu!");
    }
  };

  const columns = [
    {
      key: "name",
      label: "BAŞLIK",
      render: (property: any) => (
        <TableCell className="text-left">{property.name}</TableCell>
      ),
    },
    {
      key: "price",
      label: "FİYAT",
      render: (property: any) => (
        <TableCell className="text-right">
          {new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: "TRY",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(property.price)}
        </TableCell>
      ),
    },
    {
      key: "type",
      label: "TİP",
      render: (property: any) => (
        <TableCell className="text-center">{property.type.value}</TableCell>
      ),
    },
    {
      key: "status",
      label: "DURUM",
      render: (property: any) => (
        <TableCell className="text-center">{property.status.value}</TableCell>
      ),
    },
    {
      key: "publishingStatus",
      label: "Yayın Durumu",
      render: (property: any) => {
        console.log("Property publishing status:", property.publishingStatus);
        const isPublished = property.publishingStatus === "PUBLISHED";
        return (
          <TableCell>
            <div className="flex items-center gap-2">
              <span className={isPublished ? "text-success" : "text-warning"}>
                {isPublished ? "Yayında" : "Beklemede"}
              </span>
              <Switch
                isSelected={isPublished}
                onValueChange={(checked) =>
                  handlePublishChange(property.id, checked)
                }
                size="sm"
                color="success"
              />
            </div>
          </TableCell>
        );
      },
    },
    {
      key: "actions",
      label: "İŞLEMLER",
      render: (property: any) => (
        <TableCell>
          <div className="flex items-center justify-end gap-4">
            <Tooltip content="Ön İzleme">
              <Link href={`/property/${property.id}`}>
                <EyeIcon className="w-5 text-slate-500" />
              </Link>
            </Tooltip>
            <Tooltip content="İlanı Düzenle" color="warning">
              <Link href={`/user/properties/${property.id}/edit`}>
                <PencilIcon className="w-5 text-yellow-500" />
              </Link>
            </Tooltip>
            <Tooltip content="İlanı Sil" color="danger">
              <Link href={`/user/properties/${property.id}/delete`}>
                <TrashIcon className="w-5 text-red-500" />
              </Link>
            </Tooltip>
          </div>
        </TableCell>
      ),
    },
  ];

  return (
    <div className="flex flex-col items-center gap-4">
      <Table>
        <TableHeader>
          <TableColumn className="text-left">BAŞLIK</TableColumn>
          <TableColumn className="text-right">FİYAT</TableColumn>
          <TableColumn className="text-center">TİP</TableColumn>
          <TableColumn className="text-center">DURUM</TableColumn>
          <TableColumn className="text-center">YAYIN DURUMU</TableColumn>
          <TableColumn className="text-right">İŞLEMLER</TableColumn>
        </TableHeader>
        <TableBody>
          {properties.map((item, index) => (
            <TableRow key={index}>
              {columns.map((column) => column.render(item))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination
        total={totalPages}
        initialPage={0}
        page={currentPage}
        onChange={(page) => router.push(`/user/properties?pagenum=${page}`)}
      />
    </div>
  );
};

export default PropertiesTable;

type Props2 = {
  properties: Prisma.PropertyGetPayload<{
    include: {
      type: true;
      status: true;
    };
  }>[];
  totalPages: number;
  currentPage: number;
};

// Update the data fetching to include publishingStatus
const fetchProperties = async (page: number) => {
  try {
    const response = await fetch(
      `/api/properties?page=${page}&limit=10&include=publishingStatus`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching properties:", error);
    return null;
  }
};
