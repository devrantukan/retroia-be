"use client";
import { ShareIcon } from "@heroicons/react/16/solid";
import { EyeIcon } from "@heroicons/react/16/solid";
import {
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
} from "@nextui-org/react";
import { Prisma, Property } from "@prisma/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { Input } from "@nextui-org/input";
import { MagnifyingGlassIcon } from "@heroicons/react/16/solid";
import { useState } from "react";

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
  user: {
    officeWorkerId: number;
    slug: string;
  };
};

const PropertiesTable = ({
  properties,
  totalPages,
  currentPage,
  totalCount,
  searchTerm,
  user,
}: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchTerm);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    params.set("pagenum", "0");
    router.push(`/user/property-share?${params.toString()}`);
  };

  const handleShare = async (propertyId: number) => {
    try {
      const shareUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/portfoy/${propertyId}/${user.officeWorkerId}/${user.slug}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success("İlan linki kopyalandı!");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast.error("Link kopyalanırken bir hata oluştu!");
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
      key: "agent",
      label: "DANIŞMAN",
      render: (property: any) => (
        <TableCell>
          {property.agent?.name} {property.agent?.surname}
        </TableCell>
      ),
    },
    {
      key: "createdAt",
      label: "OLUŞTURMA TARİHİ",
      render: (property: any) => (
        <TableCell className="text-center">
          {new Date(property.createdAt).toLocaleDateString("tr-TR")}
        </TableCell>
      ),
    },
    {
      key: "updatedAt",
      label: "SON GÜNCELLEME TARİHİ",
      render: (property: any) => (
        <TableCell className="text-center">
          {new Date(property.updatedAt).toLocaleDateString("tr-TR")}
        </TableCell>
      ),
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
            <Tooltip content="İlanı Paylaş">
              <button onClick={() => handleShare(property.id)}>
                <ShareIcon className="w-5 text-blue-500" />
              </button>
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
          placeholder="İlan adı veya danışman adı ile arama yapın..."
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
          startContent={
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
          }
          className="w-full"
        />
      </div>
      <div className="w-full text-sm text-gray-500 mb-4">
        {searchValue ? (
          <p>{totalCount} kayıt bulundu</p>
        ) : (
          <p>Toplam {totalCount} kayıt</p>
        )}
      </div>
      <Table>
        <TableHeader>
          <TableColumn className="text-left">BAŞLIK</TableColumn>
          <TableColumn className="text-right">FİYAT</TableColumn>
          <TableColumn className="text-center">TİP</TableColumn>
          <TableColumn className="text-center">DURUM</TableColumn>
          <TableColumn className="text-left">DANIŞMAN</TableColumn>
          <TableColumn className="text-center">OLUŞTURMA TARİHİ</TableColumn>
          <TableColumn className="text-center">
            SON GÜNCELLEME TARİHİ
          </TableColumn>
          <TableColumn className="text-right">İŞLEMLER</TableColumn>
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
          router.push(`/user/property-share?${params.toString()}`);
        }}
      />
    </div>
  );
};

export default PropertiesTable;
