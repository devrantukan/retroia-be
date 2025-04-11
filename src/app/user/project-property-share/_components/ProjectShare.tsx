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

interface Project {
  id: number;
  name: string;
  description: string;
  catalogUrl: string | null;
  createdAt: string;
  updatedAt: string;
  location: {
    city: string;
    district: string;
    neighborhood: string;
  } | null;
}

interface ProjectShareProps {
  user: {
    id: string;
    officeWorkerId: number;
    slug: string;
  };
}

export default function ProjectShare({ user }: ProjectShareProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/projects?page=${currentPage}&search=${searchValue}`
      );
      if (!response.ok) throw new Error("Projeler yüklenemedi");
      const data = await response.json();
      if (data.success) {
        setProjects(data.data);
        setTotalPages(data.totalPages);
        setTotalCount(data.total);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast.error("Projeler yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchValue]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

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

  const handleShare = async (projectId: number) => {
    try {
      const project = projects.find((p) => p.id === projectId);
      if (!project) {
        toast.error("Proje bulunamadı!");
        return;
      }

      // Convert project name to slug format
      const projectSlug = project.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const shareUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/emlak/projelerimiz/${projectSlug}/${projectId}/${user.slug}/`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Proje linki kopyalandı!");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast.error("Link kopyalanırken bir hata oluştu!");
    }
  };

  const columns = [
    {
      key: "name",
      label: "BAŞLIK",
      render: (project: Project) => (
        <TableCell className="text-left">{project.name}</TableCell>
      ),
    },
    {
      key: "description",
      label: "AÇIKLAMA",
      render: (project: Project) => (
        <TableCell className="text-left">{project.description}</TableCell>
      ),
    },
    {
      key: "location",
      label: "KONUM",
      render: (project: Project) => (
        <TableCell className="text-center">
          {project.location
            ? `${project.location.city} / ${project.location.district} / ${project.location.neighborhood}`
            : "-"}
        </TableCell>
      ),
    },
    {
      key: "createdAt",
      label: "OLUŞTURMA TARİHİ",
      render: (project: Project) => (
        <TableCell className="text-center">
          {new Date(project.createdAt).toLocaleDateString("tr-TR")}
        </TableCell>
      ),
    },
    {
      key: "updatedAt",
      label: "SON GÜNCELLEME TARİHİ",
      render: (project: Project) => (
        <TableCell className="text-center">
          {new Date(project.updatedAt).toLocaleDateString("tr-TR")}
        </TableCell>
      ),
    },
    {
      key: "actions",
      label: "İŞLEMLER",
      render: (project: Project) => (
        <TableCell>
          <div className="flex items-center justify-end gap-4">
            <Tooltip content="Projeyi Paylaş">
              <button onClick={() => handleShare(project.id)}>
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
      {totalCount > 0 ? (
        <>
          <div className="w-full max-w-md mb-4">
            <Input
              placeholder="Proje adı ile arama yapın..."
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
              {projects.map((item) => (
                <TableRow key={item.id}>
                  {columns.map((column) => column.render(item))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <Pagination
              total={totalPages}
              initialPage={0}
              page={currentPage}
              onChange={(page) => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("pagenum", page.toString());
                router.push(
                  `/user/project-property-share?${params.toString()}`
                );
              }}
            />
          )}
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">
            Size atanmış herhangi bir proje bulunmamaktadır.
          </p>
        </div>
      )}
    </div>
  );
}
