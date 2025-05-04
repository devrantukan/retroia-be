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
import { useRouter, useSearchParams } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updatePublishingStatus } from "@/app/actions/updatePropertyStatus";
import { revalidateProperty } from "@/lib/actions/property";
import { toast } from "react-toastify";
import { Input } from "@nextui-org/input";
import { MagnifyingGlassIcon } from "@heroicons/react/16/solid";
import { useState, useEffect } from "react";

type SortDirection = "asc" | "desc";

type Props = {
  properties: Prisma.PropertyGetPayload<{
    include: {
      status: true;
      images: true;
      type: true;
      agent: true;
    };
  }>[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
  searchTerm: string;
};

const PropertiesTable = ({
  properties,
  totalPages,
  currentPage,
  totalCount,
  searchTerm: initialSearchTerm,
}: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [sortKey, setSortKey] = useState<string>("id");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Update search term when initialSearchTerm changes
  useEffect(() => {
    setSearchTerm(initialSearchTerm);
  }, [initialSearchTerm]);

  const handleSort = (key: string) => {
    const newDirection =
      key === sortKey && sortDirection === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortDirection(newDirection);

    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", key);
    params.set("direction", newDirection);
    router.push(`/user/properties?${params.toString()}`);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set("search", value);
    params.set("pagenum", "1"); // Reset to first page when searching
    router.push(`/user/properties?${params.toString()}`);
  };

  const handlePublishChange = async (
    propertyId: number,
    isPublished: boolean
  ) => {
    try {
      const result = await updatePublishingStatus(
        propertyId.toString(),
        isPublished ? "PUBLISHED" : "PENDING"
      );

      if (!result) {
        throw new Error("Failed to update status");
      }

      // Update Typesense index
      const typesenseResponse = await fetch("/api/typesense/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          propertyId,
          isPublished,
        }),
      });

      if (!typesenseResponse.ok) {
        console.error(
          "Failed to update Typesense:",
          await typesenseResponse.text()
        );
        // Don't throw here, just log the error
      }

      // Revalidate using server-side function
      await revalidateProperty(propertyId.toString());

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
      key: "id",
      label: "ID",
      sortable: true,
      render: (property: any) => (
        <TableCell className="text-left">{property.id}</TableCell>
      ),
    },
    {
      key: "name",
      label: "BAŞLIK",
      sortable: true,
      render: (property: any) => (
        <TableCell className="text-left">{property.name}</TableCell>
      ),
    },
    {
      key: "price",
      label: "FİYAT",
      sortable: true,
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
      sortable: true,
      render: (property: any) => (
        <TableCell className="text-center">{property.type.value}</TableCell>
      ),
    },
    {
      key: "status",
      label: "DURUM",
      sortable: true,
      render: (property: any) => (
        <TableCell className="text-center">{property.status.value}</TableCell>
      ),
    },
    {
      key: "publishingStatus",
      label: "Yayın Durumu",
      sortable: true,
      render: (property: any) => {
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
      key: "agent",
      label: "DANIŞMAN",
      sortable: true,
      render: (property: any) => (
        <TableCell>
          {property.agent?.name} {property.agent?.surname}
        </TableCell>
      ),
    },
    {
      key: "createdAt",
      label: "OLUŞTURMA TARİHİ",
      sortable: true,
      render: (property: any) => (
        <TableCell className="text-center">
          {new Date(property.createdAt).toLocaleDateString("tr-TR")}
        </TableCell>
      ),
    },
    {
      key: "updatedAt",
      label: "SON GÜNCELLEME TARİHİ",
      sortable: true,
      render: (property: any) => (
        <TableCell className="text-center">
          {new Date(property.updatedAt).toLocaleDateString("tr-TR")}
        </TableCell>
      ),
    },
    {
      key: "actions",
      label: "İŞLEMLER",
      sortable: false,
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
    <div className="flex flex-col items-center gap-4 w-full mt-8">
      <div className="w-full max-w-md mb-4">
        <Input
          placeholder="İlan adı, danışman adı veya ID ile arama yapın..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          startContent={
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
          }
          className="w-full"
        />
      </div>
      <div className="w-full text-sm text-gray-500 mb-4">
        Toplam {totalCount} kayıt bulundu
      </div>
      <Table>
        <TableHeader>
          {columns.map((column) => (
            <TableColumn
              key={column.key}
              className={column.sortable ? "cursor-pointer select-none" : ""}
              onClick={() => column.sortable && handleSort(column.key)}
            >
              <div className="flex items-center gap-1">
                {column.label}
                {column.sortable && sortKey === column.key && (
                  <span className="text-xs">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </TableColumn>
          ))}
        </TableHeader>
        <TableBody>
          {properties.map((item) => (
            <TableRow key={item.id}>
              {columns.map((column) => column.render(item))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination
        total={totalPages}
        initialPage={0}
        page={currentPage}
        onChange={(page) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("pagenum", page.toString());
          router.push(`/user/properties?${params.toString()}`);
        }}
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
