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
import { Prisma } from "@prisma/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { Input } from "@nextui-org/input";
import { MagnifyingGlassIcon } from "@heroicons/react/16/solid";
import { useState, useEffect } from "react";
import { deleteProject } from "@/app/actions/project";

type Props = {
  projects: {
    id: number;
    name: string;
    description: string;
    officeId: number;
    assignedAgents: string;
    publishingStatus: string;
    startDate: Date;
    endDate: Date;
    deedInfo: string;
    landArea: string;
    nOfUnits: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
    location: {
      id: number;
      streetAddress: string;
      city: string;
      state: string;
      zip: string;
      country: string;
      landmark: string;
      district: string;
      neighborhood: string;
      projectId: number;
    } | null;
    feature: {
      id: number;
      bedrooms: number;
      bathrooms: number;
      floor: number;
      totalFloor: number;
      area: number;
      hasSwimmingPool: boolean;
      hasGardenYard: boolean;
      hasBalcony: boolean;
      projectId: number;
    } | null;
    unitSizes: {
      id: number;
      value: string;
      projectId: number;
    }[];
    socialFeatures: {
      id: number;
      value: string;
      projectId: number;
    }[];
    images: {
      id: number;
      url: string;
      projectId: number;
    }[];
  }[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
  searchTerm: string;
};

const ProjectsTable = ({
  projects,
  totalPages,
  currentPage,
  totalCount,
  searchTerm: initialSearchTerm,
}: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  useEffect(() => {
    setSearchTerm(initialSearchTerm);
  }, [initialSearchTerm]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set("search", value);
    params.set("pagenum", "1");
    router.push(`/admin/projects?${params.toString()}`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu projeyi silmek istediğinizden emin misiniz?")) {
      return;
    }

    const result = await deleteProject(id);
    if (result.success) {
      toast.success("Proje başarıyla silindi");
      router.refresh();
    } else {
      toast.error(result.error || "Proje silinirken bir hata oluştu");
    }
  };

  const columns = [
    {
      key: "name",
      label: "PROJE ADI",
      render: (project: any) => (
        <TableCell key={`name-${project.id}`} className="text-left">
          {project.name}
        </TableCell>
      ),
    },
    {
      key: "location",
      label: "KONUM",
      render: (project: any) => (
        <TableCell key={`location-${project.id}`}>
          {project.location?.city}, {project.location?.district}
        </TableCell>
      ),
    },
    {
      key: "feature",
      label: "ÖZELLİKLER",
      render: (project: any) => (
        <TableCell key={`feature-${project.id}`}>
          {project.feature?.bedrooms} Yatak Odası, {project.feature?.bathrooms}{" "}
          Banyo
        </TableCell>
      ),
    },
    {
      key: "unitSizes",
      label: "BİRİM BÜYÜKLÜKLERİ",
      render: (project: any) => (
        <TableCell key={`unitSizes-${project.id}`}>
          {project.unitSizes.map((size: any) => size.value).join(", ")}
        </TableCell>
      ),
    },
    {
      key: "publishingStatus",
      label: "YAYIN DURUMU",
      render: (project: any) => (
        <TableCell key={`publishingStatus-${project.id}`}>
          <Switch
            isSelected={project.publishingStatus === "PUBLISHED"}
            onValueChange={async (checked) => {
              try {
                const response = await fetch(`/api/projects/${project.id}`, {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    publishingStatus: checked ? "PUBLISHED" : "DRAFT",
                  }),
                });

                if (response.ok) {
                  router.refresh();
                } else {
                  toast.error("Yayın durumu güncellenirken bir hata oluştu");
                }
              } catch (error) {
                toast.error("Yayın durumu güncellenirken bir hata oluştu");
              }
            }}
            size="sm"
            color="primary"
          >
            {project.publishingStatus === "PUBLISHED" ? "Yayında" : "Taslak"}
          </Switch>
        </TableCell>
      ),
    },
    {
      key: "createdAt",
      label: "OLUŞTURMA TARİHİ",
      render: (project: any) => (
        <TableCell key={`createdAt-${project.id}`} className="text-center">
          {new Date(project.createdAt).toLocaleDateString("tr-TR")}
        </TableCell>
      ),
    },
    {
      key: "actions",
      label: "İŞLEMLER",
      render: (project: any) => (
        <TableCell key={`actions-${project.id}`}>
          <div className="flex items-center justify-end gap-4">
            <Tooltip content="Ön İzleme">
              <Link href={`/admin/projects/${project.id}`}>
                <EyeIcon className="w-5 text-slate-500" />
              </Link>
            </Tooltip>
            <Tooltip content="Düzenle" color="warning">
              <Link href={`/admin/projects/${project.id}/edit`}>
                <PencilIcon className="w-5 text-yellow-500" />
              </Link>
            </Tooltip>
            <Tooltip content="Sil" color="danger">
              <button onClick={() => handleDelete(project.id)}>
                <TrashIcon className="w-5 text-red-500" />
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
          placeholder="Proje adı veya konum ile arama yapın..."
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
            <TableColumn key={column.key}>{column.label}</TableColumn>
          ))}
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              {columns.map((column) => column.render(project))}
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
          router.push(`/admin/projects?${params.toString()}`);
        }}
      />
    </div>
  );
};

export default ProjectsTable;
