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
              <TableCell className="text-left">{item.name}</TableCell>
              <TableCell className="text-right">
                {new Intl.NumberFormat("tr-TR", {
                  style: "currency",
                  currency: "TRY",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(item.price)}
              </TableCell>
              <TableCell className="text-center">{item.type.value}</TableCell>
              <TableCell className="text-center">{item.status.value}</TableCell>
              <TableCell className="text-center">
                <Switch
                  defaultSelected={item.publishingStatus === "PUBLISHED"}
                  size="sm"
                  color="success"
                  onChange={async (e) => {
                    const newStatus = e.target.checked
                      ? "PUBLISHED"
                      : "PENDING";
                    await updatePublishingStatus(item.id.toString(), newStatus);
                    router.refresh();
                  }}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-4">
                  <Tooltip content="Ön İzleme">
                    <Link href={`/property/${item.id}`}>
                      <EyeIcon className="w-5 text-slate-500" />
                    </Link>
                  </Tooltip>
                  <Tooltip content="İlanı Düzenle" color="warning">
                    <Link href={`/user/properties/${item.id}/edit`}>
                      <PencilIcon className="w-5 text-yellow-500" />
                    </Link>
                  </Tooltip>
                  <Tooltip content="İlanı Sil" color="danger">
                    <Link href={`/user/properties/${item.id}/delete`}>
                      <TrashIcon className="w-5 text-red-500" />
                    </Link>
                  </Tooltip>
                </div>
              </TableCell>
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
