"use server";

import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/validations/project";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";

export async function createProject(data: z.infer<typeof projectSchema>) {
  try {
    const validatedData = projectSchema.parse(data);

    const project = await prisma.project.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        officeId: validatedData.officeId,
        assignedAgents: validatedData.assignedAgents,
        publishingStatus: validatedData.publishingStatus,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        deedInfo: validatedData.deedInfo,
        landArea: validatedData.landArea,
        nOfUnits: validatedData.nOfUnits,
        slug: validatedData.slug,
        location: {
          create: validatedData.location,
        },
        unitSizes: {
          create: validatedData.unitSizes,
        },
        socialFeatures: {
          create: validatedData.socialFeatures,
        },
        images: {
          create: validatedData.images,
        },
      },
    });

    return { success: true, data: project };
  } catch (error) {
    console.error("Error creating project:", error);
    return { success: false, error: "Failed to create project" };
  }
}

export async function updateProject(
  id: number,
  data: z.infer<typeof projectSchema>
) {
  try {
    const validatedData = projectSchema.parse(data);

    // First, delete related records
    await prisma.project.update({
      where: { id },
      data: {
        unitSizes: {
          deleteMany: {},
        },
        socialFeatures: {
          deleteMany: {},
        },
        images: {
          deleteMany: {},
        },
      },
    });

    // Then update the project with all related data
    const project = await prisma.project.update({
      where: { id },
      data: {
        name: validatedData.name,
        description: validatedData.description,
        officeId: validatedData.officeId,
        assignedAgents: validatedData.assignedAgents,
        publishingStatus: validatedData.publishingStatus,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        deedInfo: validatedData.deedInfo,
        landArea: validatedData.landArea,
        nOfUnits: validatedData.nOfUnits,
        slug: validatedData.slug,
        catalogUrl: validatedData.catalogUrl,
        location: {
          upsert: {
            create: validatedData.location,
            update: validatedData.location,
          },
        },
        unitSizes: {
          create: validatedData.unitSizes,
        },
        socialFeatures: {
          create: validatedData.socialFeatures,
        },
        images: {
          create: validatedData.images,
        },
      },
    });

    return { success: true, data: project };
  } catch (error) {
    console.error("Error updating project:", error);
    return { success: false, error: "Failed to update project" };
  }
}

export async function deleteProject(id: number) {
  try {
    await prisma.project.delete({
      where: { id },
    });

    revalidatePath("/admin/projects");
    return { success: true };
  } catch (error) {
    console.error("Error deleting project:", error);
    return { success: false, error: "Proje silinirken bir hata oluştu" };
  }
}

export async function getProject(id: number) {
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        location: true,
        unitSizes: true,
        socialFeatures: true,
        images: true,
      },
    });

    return { success: true, data: project };
  } catch (error) {
    console.error("Error fetching project:", error);
    return { success: false, error: "Proje getirilirken bir hata oluştu" };
  }
}

export async function getProjects(page: number = 1, search: string = "") {
  try {
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    const where: Prisma.ProjectWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            {
              description: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              location: {
                city: { contains: search, mode: Prisma.QueryMode.insensitive },
              },
            },
            {
              location: {
                district: {
                  contains: search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            },
          ],
        }
      : {};

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          location: true,
          unitSizes: true,
          socialFeatures: true,
          images: true,
        },
      }),
      prisma.project.count({ where }),
    ]);

    return {
      success: true,
      data: projects,
      total,
      totalPages: Math.ceil(total / pageSize),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching projects:", error);
    return { success: false, error: "Projeler getirilirken bir hata oluştu" };
  }
}
