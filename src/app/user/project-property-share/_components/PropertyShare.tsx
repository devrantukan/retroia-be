"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Pagination,
  Input,
  Tooltip,
} from "@nextui-org/react";
import { toast } from "react-toastify";
import {
  ShareIcon,
  EyeIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/16/solid";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface Property {
  id: number;
  name: string;
  description: string;
  price: number;
  type: {
    value: string;
  };
  status: {
    value: string;
  };
  agent: {
    name: string;
    surname: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  images: any[];
}

interface PropertyShareProps {
  user: {
    id: string;
    officeWorkerId: number;
    slug: string;
  };
}

export default function PropertyShare({ user }: PropertyShareProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const fetchProperties = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/properties?page=${currentPage}&search=${searchValue}`
      );
      if (!response.ok) throw new Error("Emlaklar yüklenemedi");
      const data = await response.json();
      if (data.items) {
        setProperties(data.items);
        setTotalPages(Math.ceil(data.total / 10));
        setTotalCount(data.total);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast.error("Emlaklar yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchValue]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    params.set("pagenum", "0");
    router.push(`/user/project-property-share?${params.toString()}`);
  };

  const handleShare = async (propertyId: number) => {
    try {
      const shareUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/portfoy/${propertyId}/${user.officeWorkerId}/${user.slug}/`;
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
      render: (property: Property) => (
        <TableCell className="text-left">{property.name}</TableCell>
      ),
    },
    {
      key: "price",
      label: "FİYAT",
      render: (property: Property) => (
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
      render: (property: Property) => (
        <TableCell className="text-center">{property.type.value}</TableCell>
      ),
    },
    {
      key: "status",
      label: "DURUM",
      render: (property: Property) => (
        <TableCell className="text-center">{property.status.value}</TableCell>
      ),
    },
    {
      key: "agent",
      label: "DANIŞMAN",
      render: (property: Property) => (
        <TableCell>
          {property.agent
            ? `${property.agent.name} ${property.agent.surname}`
            : "-"}
        </TableCell>
      ),
    },
    {
      key: "createdAt",
      label: "OLUŞTURMA TARİHİ",
      render: (property: Property) => (
        <TableCell className="text-center">
          {new Date(property.createdAt).toLocaleDateString("tr-TR")}
        </TableCell>
      ),
    },
    {
      key: "updatedAt",
      label: "SON GÜNCELLEME TARİHİ",
      render: (property: Property) => (
        <TableCell className="text-center">
          {new Date(property.updatedAt).toLocaleDateString("tr-TR")}
        </TableCell>
      ),
    },
    {
      key: "actions",
      label: "İŞLEMLER",
      render: (property: Property) => (
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
          {columns.map((column) => (
            <TableColumn
              key={column.key}
              className={column.key === "actions" ? "text-right" : ""}
            >
              {column.label}
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
          router.push(`/user/project-property-share?${params.toString()}`);
        }}
      />
    </div>
  );
}
